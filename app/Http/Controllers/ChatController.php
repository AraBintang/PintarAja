<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Services\AiUploadFileService;
use App\Services\AiProviderService;
use App\Services\UsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function index(Request $request, UsageService $usageService)
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
            ->orderByRaw("CASE 
                WHEN s.M_SettingCode = 'SETTING-GPT' THEN 1
                WHEN s.M_SettingCode = 'SETTING-GMN' THEN 2
                WHEN s.M_SettingCode = 'SETTING-CLD' THEN 3
                WHEN s.M_SettingCode = 'SETTING-DSK' THEN 4
                WHEN s.M_SettingCode = 'SETTING-QWN' THEN 5
                ELSE 6
            END")
            ->get();

        return response()->json([
            'ai' => $aiProviders,
            'quota' => $usageService->getQuotaByUser($user->M_UserID),
        ]);
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
                $annotations = [];
                if (!empty($chat->T_ChatAnnotations)) {
                    $decoded = json_decode($chat->T_ChatAnnotations, true);
                    if (is_array($decoded)) {
                        $annotations = $decoded;
                    }
                }

                return [
                    'id' => $chat->T_ChatID,
                    'conversationId' => $chat->T_ChatT_ConversationID,
                    'code' => $chat->T_ChatCode,
                    'role' => $chat->T_ChatRole,
                    'content' => $chat->T_ChatContent,
                    'annotations' => $annotations,
                    'time' => Carbon::parse($chat->T_ChatCreated)->format('H:i')
                ];
            }),
            'nextCursor' => $nextCursor,
            'hasMoreChats' => $hasMore
        ]);
    }

    public function generate(Request $request, AiProviderService $aiService, UsageService $usageService)
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

        $provider = $this->resolveProvider($user, $request->providerId);
        if (!$provider) {
            return response()->json([
                'message' => 'You are not allowed to use this AI provider with your current subscription plan.',
            ], 403);
        }

        if (empty($provider->M_SettingKey)) {
            return response()->json([
                'message' => 'AI provider configuration is missing API key.'
            ], 500);
        }

        if (!$usageService->checkQuota($user->M_UserID, $provider->M_SettingCode)) {
            $remaining = $usageService->getRemainingQuota($user->M_UserID, $provider->M_SettingCode);
            return response()->json([
                'message' => 'Batas penggunaan harian tercapai. Coba lagi besok.',
                'quota_remaining' => $remaining,
            ], 429);
        }

        $conversationId = $request->conversationId;
        $message = $request->message;
        $messages = $request->messageToAi ?? [];

        $lastMsg = !empty($messages) ? end($messages) : null;
        $hasImages = isset($lastMsg['content']) && is_array($lastMsg['content']);
 
        if ($hasImages) {
            $chatContent = array_values(array_map(function ($part) {
                if (($part['type'] ?? '') === 'image_url') {
                    $base64 = $part['image_url']['url'] ?? null;
                    return [
                        'type' => 'image',
                        'name' => $part['name'] ?? 'gambar',
                        'base64' => $base64,
                    ];
                }
                return $part;
            }, $lastMsg['content']));
 
            Chat::create([
                'T_ChatT_ConversationID' => $conversationId,
                'T_ChatRole' => 'user',
                'T_ChatContent' => json_encode($chatContent),
            ]);
        } else {
            Chat::create([
                'T_ChatT_ConversationID' => $conversationId,
                'T_ChatRole' => 'user',
                'T_ChatContent' => $message,
            ]);
        }

        $driver = $this->getDriver($provider->M_SettingCode);
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
            $response = $handlers[$driver]();
            
            $usageService->increment($user->M_UserID, $provider->M_SettingCode);
            
            return $response;
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'AI generation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function generateFromFile(Request $request, AiUploadFileService $aiUploadFileService)
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

        $provider = $this->resolveProvider($user, $request->providerId);
        if (!$provider) {
            return response()->json(['message' => 'You are not allowed to use this AI provider.'], 403);
        }

        $message = $request->message;
        $convId = $request->conversationId;
        $files = $request->file('files', []);
 
        $chatContent = [['type' => 'text', 'text' => $message]];
        foreach ($files as $file) {
            $isImage = str_starts_with($file->getMimeType(), 'image/');
            $entry = [
                'type' => $isImage ? 'image' : 'file',
                'name' => $file->getClientOriginalName(),
            ];
 
            if ($isImage) {
                $mimeType = $file->getMimeType();
                $base64Data  = base64_encode(file_get_contents($file->getRealPath()));
                $entry['base64'] = "data:{$mimeType};base64,{$base64Data}";
            }
 
            $chatContent[] = $entry;
        }

        Chat::create([
            'T_ChatT_ConversationID' => $convId,
            'T_ChatRole' => 'user',
            'T_ChatContent' => json_encode($chatContent),
        ]);

        $fileData = array_map(function ($file) {
            return [
                'name' => $file->getClientOriginalName(),
                'type' => $file->getMimeType(),
                'base64' => base64_encode(file_get_contents($file->getRealPath())),
                'isImage' => str_starts_with($file->getMimeType(), 'image/'),
            ];
        }, $files);

        return match ($provider->M_SettingCode) {
            'SETTING-GPT' => $aiUploadFileService->handleOpenAiFileStream($provider, $message, $fileData, $convId),
            'SETTING-GMN' => $aiUploadFileService->handleGeminiFile($provider, $message, $fileData, $convId),
            default => response()->json(['message' => 'Provider not supported for file input.'], 400),
        };
    }

    private function resolveProvider($user, int $providerId)
    {
        return DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingID', $providerId)
            ->where('s.M_SettingIsActive', 'Y')
            ->select('s.M_SettingCode', 's.M_SettingModel', 's.M_SettingKey')
            ->first();
    }
 
    private function getDriver(string $code): ?string
    {
        return [
            'SETTING-GPT' => 'openai',
            'SETTING-GMN' => 'gemini',
            'SETTING-CLD' => 'claude',
            'SETTING-DSK' => 'deepseek',
            'SETTING-QWN' => 'qwen',
        ][$code] ?? null;
    }
}