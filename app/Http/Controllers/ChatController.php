<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\SettingAI;
use App\Services\AiProviderService;
use App\Services\AiUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use OpenAI;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User authentication failed.'
            ],401);
        }

        $aiProviders = DB::table('m_plansetting as ps')
            ->join('m_setting as s','s.M_SettingID','=','ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID',$user->M_UserPlan)
            ->where('s.M_SettingIsActive','Y')
            ->select(
                's.M_SettingID as id',
                's.M_SettingCode as code',
                's.M_SettingModel as model'
            )
            ->get();

        return response()->json($aiProviders);
    }
    public function index2(Request $request, $conversationId)
    {
        $cursor = $request->input('cursor');
        $limit = 20;

        $query = Chat::where('T_ChatT_ConversationID', $conversationId);

        if ($cursor) {
            $query->where('T_ChatID', '<', $cursor);
        }

        $chats = $query
            ->orderByDesc('T_ChatID')
            ->limit($limit + 1)
            ->get();

        $hasMore = $chats->count() > $limit;

        $chats = $chats->take($limit);

        $nextCursor = $chats->last()?->T_ChatID;

        return response()->json([
            'chats' => $chats->reverse()->values()->map(function ($chat) {
                return [
                    'id' => $chat->T_ChatID,
                    'conversationId' => $chat->T_ChatT_ConversationID,
                    'code' => $chat->T_ChatCode,
                    'role' => $chat->T_ChatRole,
                    'content' => $chat->T_ChatContent,
                    'time' => Carbon::parse($chat->T_ChatCreated)->format('H:i')
                ];
            }),
            'nextCursor' => $nextCursor,
            'hasMoreChats' => $hasMore
        ]);
    }

    public function generate(Request $request, AiProviderService $aiService)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'conversationId' => 'required|integer',
            'message' => 'required|string',
            'messageToAi' => 'array|max:10'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User authentication failed.'
            ], 401);
        }

        $provider = DB::table('m_plansetting as ps')
            ->join('m_setting as s','s.M_SettingID','=','ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID',$user->M_UserPlan)
            ->where('s.M_SettingID',$request->providerId)
            ->where('s.M_SettingIsActive','Y')
            ->select(
                's.M_SettingCode',
                's.M_SettingModel',
                's.M_SettingKey'
            )
            ->first();

        if (!$provider) {
            return response()->json([
                'message' => 'You are not allowed to use this AI provider with your current subscription plan.'
            ], 403);
        }

        if (empty($provider->M_SettingKey)) {
            return response()->json([
                'message' => 'AI provider configuration is missing API key.'
            ], 500);
        }

        $conversationId = $request->conversationId;
        $message = $request->message;
        $messages = $request->messageToAi ?? [];

        $chat = Chat::create([
            'T_ChatT_ConversationID' => $conversationId,
            'T_ChatRole' => 'user',
            'T_ChatContent' => $message
        ]);

        $providerMap = [
            'SETTING-GPT' => 'openai',
            'SETTING-GMN' => 'gemini',
            'SETTING-CLD' => 'claude',
            'SETTING-DSK' => 'deepseek',
            'SETTING-QWN' => 'qwen',
        ];

        $driver = $providerMap[$provider->M_SettingCode] ?? null;

        if (!$driver) {
            return response()->json([
                'message' => 'Unsupported AI provider.'
            ], 400);
        }

        $handlers = [
            'openai' => fn() => $aiService->streamOpenAI($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
            'gemini' => fn() => $aiService->streamGemini($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
            'claude' => fn() => $aiService->streamClaude($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
            'deepseek' => fn() => $aiService->streamDeepSeek($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
            'qwen' => fn() => $aiService->streamQwen($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
        ];

        try {
            return $handlers[$driver]();
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'AI generation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function uploadFile(Request $request, AiUploadService $service)
    {
        if (!$request->hasFile('files')) {
            return response()->json(['message' => 'No files uploaded'], 400);
        }

        $request->validate([
            'providerId' => 'required|integer'
        ]);

        $user = $request->user();

        $provider = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingID', $request->providerId)
            ->where('s.M_SettingIsActive', 'Y')
            ->select('s.M_SettingCode', 's.M_SettingKey', 's.M_SettingModel')
            ->first();

        if (!$provider) {
            return response()->json([
                'message' => 'You are not allowed to use this AI provider.'
            ], 403);
        }

        $files = $request->file('files');

        try {
            if ($provider->M_SettingCode === 'SETTING-GPT') {
                return $service->uploadOpenAI($provider->M_SettingKey, $files);
            }

            if ($provider->M_SettingCode === 'SETTING-GMN') {
                return $service->uploadGemini($provider->M_SettingKey, $files);
            }

            return response()->json(['message' => 'Provider not supported'], 400);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteFile(Request $request)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'fileId' => 'required|string'
        ]);

        $user = $request->user();

        $provider = SettingAI::where('M_SettingID', $request->providerId)
            ->where('M_SettingIsActive', 'Y')
            ->first();

        if (!$provider) {
            return response()->json(['message' => 'Provider not found'], 404);
        }

        try {
            if ($provider->M_SettingCode === 'SETTING-GPT') {
                OpenAI::client($provider->M_SettingKey)
                    ->files()
                    ->delete($request->fileId);
            }

            if ($provider->M_SettingCode === 'SETTING-GMN') {
                Http::delete(
                    "https://generativelanguage.googleapis.com/v1beta/files/{$request->fileId}?key={$provider->M_SettingKey}"
                );
            }

            return response()->json(['message' => 'File deleted']);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to delete file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateFromFile(Request $request)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'conversationId' => 'required|integer',
            'message' => 'required|string',
            'files'=> 'array',
            'fileData'=> 'array' // name sama type
        ]);

        $user = $request->user();

        $provider = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingID', $request->providerId)
            ->where('s.M_SettingIsActive', 'Y')
            ->select('s.M_SettingCode', 's.M_SettingKey', 's.M_SettingModel')
            ->first();

        if (!$provider) {
            return response()->json([
                'message' => 'You are not allowed to use this AI provider.'
            ], 403);
        }

        $message = $request->message;

        $chatContent = [
            [
                "type" => "text",
                "text" => $message
            ]
        ];

        foreach ($fileData as $file) {
            $chatContent[] = [
                "type" => "file",
                "name" => $file['name'],
                "filetype" => $file['type']
            ];
        }

        Chat::create([
            'T_ChatT_ConversationID' => $request->conversationId,
            'T_ChatRole' => 'user',
            'T_ChatContent' => json_encode($chatContent)
        ]);

        try {
            if ($provider->M_SettingCode === 'SETTING-GPT') {
                return response()->stream(function () use ($provider, $message, $request) {
                    $content = [];
                    $fileIds = $request->input('files', []);

                    foreach ($fileIds as $fileId) {
                        $content[] = [
                            'type' => 'input_file',
                            'file_id' => $fileId,
                        ];
                    }

                    $content[] = [
                        'type' => 'input_text',
                        'text' => $message,
                    ];

                    $response = Http::withToken($provider->M_SettingKey)
                        ->withOptions([
                            'stream' => true
                        ])
                        ->post('https://api.openai.com/v1/responses', [
                            'model' => $provider->M_SettingModel ?? 'gpt-4o',
                            'stream' => true,
                            'input' => [
                                [
                                    'role' => 'user',
                                    'content' => $content,
                                ]
                            ],
                        ]);

                    $body = $response->getBody();

                    $output = '';

                    while (!$body->eof()) {
                        $chunk = $body->read(1024);
                        $output .= $chunk;
                        echo $chunk;
                        ob_flush();
                        flush();
                    }

                    foreach ($fileIds as $fileId) {
                        try {
                            OpenAI::client($provider->M_SettingKey)
                                ->files()
                                ->delete($fileId);
                        } catch (\Throwable $e) {
                            // ignore
                        }
                    }

                    Chat::create([ 
                      'T_ChatT_ConversationID' => $request->conversationId, 
                      'T_ChatCode' => $provider->M_SettingCode, 
                      'T_ChatRole' => 'assistant', 
                      'T_ChatContent' => $output 
                      ]);
                }, 200, [
                    'Content-Type' => 'text/event-stream',
                    'Cache-Control' => 'no-cache',
                    'Connection' => 'keep-alive',
                    'X-Accel-Buffering' => 'no'
                ]);
            }

            if ($provider->M_SettingCode === 'SETTING-GMN') {
                $model = $provider->M_SettingModel ?? 'gemini-2.0-flash';

                $response = Http::post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$provider->M_SettingKey}",
                    [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => $message]
                                ]
                            ]
                        ]
                    ]
                );

                $assistantReply = $response->json()['candidates'][0]['content']['parts'][0]['text']
                    ?? '';
            }

            Chat::create([
                'T_ChatT_ConversationID' => $request->conversationId,
                'T_ChatCode' => $provider->M_SettingCode,
                'T_ChatRole' => 'assistant',
                'T_ChatContent' => $assistantReply
            ]);

            return response()->json([
                'reply' => $assistantReply
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed generating response',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
