<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Services\AiProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

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

    public function generateFromFile(Request $request, AiProviderService $aiService)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'conversationId' => 'required|integer',
            'message' => 'required|string',
            'files' => 'array|max:3',
            'files.*' => 'file|max:10240',
        ]);
    
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
    
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
        $convId  = $request->conversationId;
        $files = $request->file('files', []);
    
        $chatContent = [['type' => 'text', 'text' => $message]];
        foreach ($files as $file) {
            $chatContent[] = [
                'type' => str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'file',
                'name' => $file->getClientOriginalName(),
            ];
        }
        Chat::create([
            'T_ChatT_ConversationID' => $convId,
            'T_ChatRole' => 'user',
            'T_ChatContent' => json_encode($chatContent),
        ]);
    
        $fileData = array_map(function ($file) {
            return [
                'name'    => $file->getClientOriginalName(),
                'type'    => $file->getMimeType(),
                'base64'  => base64_encode(file_get_contents($file->getRealPath())),
                'isImage' => str_starts_with($file->getMimeType(), 'image/'),
            ];
        }, $files);
    
        if ($provider->M_SettingCode === 'SETTING-GPT') {
            return response()->stream(function () use ($provider, $message, $fileData, $convId) {
    
                $content = [];
    
                foreach ($fileData as $f) {
                    if ($f['isImage']) {
                        $content[] = [
                            'type'      => 'image_url',
                            'image_url' => [
                                'url'    => "data:{$f['type']};base64,{$f['base64']}",
                                'detail' => 'auto',
                            ],
                        ];
                    } else {
                        $text = $this->extractTextFromFile($f['base64'], $f['type'], $f['name']);
                        $content[] = [
                            'type' => 'text',
                            'text' => "[File: {$f['name']}]\n{$text}",
                        ];
                    }
                }
    
                $content[] = ['type' => 'text', 'text' => $message];
    
                $response = Http::withToken($provider->M_SettingKey)
                    ->withOptions(['stream' => true])
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model'    => $provider->M_SettingModel ?? 'gpt-4o',
                        'stream'   => true,
                        'messages' => [
                            ['role' => 'user', 'content' => $content],
                        ],
                    ]);
    
                $body  = $response->getBody();
                $fullContent = '';
    
                while (!$body->eof()) {
                    $chunk = $body->read(1024);
    
                    foreach (explode("\n", $chunk) as $line) {
                        $line = trim($line);
                        if (!str_starts_with($line, 'data: ') || $line === 'data: [DONE]') continue;
                        try {
                            $json  = json_decode(substr($line, 6), true);
                            $delta = $json['choices'][0]['delta']['content'] ?? '';
                            if ($delta) $fullContent .= $delta;
                        } catch (\Throwable $_) {}
                    }
    
                    echo $chunk;
                    ob_flush();
                    flush();
                }
    
                Chat::create([
                    'T_ChatT_ConversationID' => $convId,
                    'T_ChatCode' => $provider->M_SettingCode,
                    'T_ChatRole' => 'assistant',
                    'T_ChatContent' => $fullContent,
                ]);
    
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'Connection' => 'keep-alive',
                'X-Accel-Buffering' => 'no',
            ]);
        }
    
        if ($provider->M_SettingCode === 'SETTING-GMN') {
            $parts = [];
    
            foreach ($fileData as $f) {
                $parts[] = [
                    'inline_data' => [
                        'mime_type' => $f['type'],
                        'data' => $f['base64'],
                    ],
                ];
            }
            $parts[] = ['text' => $message];
    
            $model = $provider->M_SettingModel ?? 'gemini-2.0-flash';
    
            $response = Http::post(
                "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$provider->M_SettingKey}",
                ['contents' => [['role' => 'user', 'parts' => $parts]]]
            );
    
            if (!$response->successful()) {
                return response()->json([
                    'message' => $response->json('error.message') ?? 'Gemini API error',
                ], 502);
            }
    
            $assistantReply = $response->json('candidates.0.content.parts.0.text') ?? '';
    
            Chat::create([
                'T_ChatT_ConversationID' => $convId,
                'T_ChatCode' => $provider->M_SettingCode,
                'T_ChatRole' => 'assistant',
                'T_ChatContent' => $assistantReply,
            ]);
    
            return response()->json(['reply' => $assistantReply]);
        }
    
        return response()->json(['message' => 'Provider not supported for file input.'], 400);
    }
    
    private function extractTextFromFile(string $base64, string $mimeType, string $name): string
    {
        $raw = base64_decode($base64);
    
        try {
            if (in_array($mimeType, ['text/plain', 'text/csv'])) {
                return $raw;
            }
    
            if ($mimeType === 'application/pdf') {
                if (class_exists('\Smalot\PdfParser\Parser')) {
                    $parser = new \Smalot\PdfParser\Parser();
                    $pdf    = $parser->parseContent($raw);
                    return $pdf->getText();
                }
                preg_match_all('/\(([^)]{1,200})\)\s*Tj/s', $raw, $m);
                return implode(' ', $m[1] ?? []);
            }
    
            if (in_array($mimeType, [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword',
            ])) {
                $tmp = sys_get_temp_dir() . '/' . uniqid('docx_') . '.docx';
                file_put_contents($tmp, $raw);
                $zip = new \ZipArchive();
                if ($zip->open($tmp) === true) {
                    $xml = $zip->getFromName('word/document.xml');
                    $zip->close();
                    @unlink($tmp);
                    return preg_replace('/\s+/', ' ', strip_tags($xml));
                }
                @unlink($tmp);
            }
        } catch (\Throwable $e) {
            //
        }
    
        return "(Konten file \"{$name}\" tidak dapat diekstrak)";
    }
}