<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Paper;
use App\Models\Section;
use App\Services\AiProviderService;
use App\Services\AiUploadFileService;
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
                WHEN s.M_SettingCode = 'SETTING-XAI' THEN 4
                WHEN s.M_SettingCode = 'SETTING-DSK' THEN 5
                WHEN s.M_SettingCode = 'SETTING-QWN' THEN 6
                ELSE 6
            END")
            ->get();

        $papers = Paper::select('M_PaperID as id', 'M_PaperName as name')
            ->orderBy('M_PaperName')->get();
    
        $sections = Section::select('M_SectionID as id', 'M_SectionM_PaperID as paper_id', 'M_SectionName as name')
            ->orderBy('M_SectionID', 'asc')->get();

        return response()->json([
            'ai' => $aiProviders,
            'quota' => $usageService->getQuotaByUser($user->M_UserID),
            'papers' => $papers,
            'sections' => $sections,
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

    public function generate(Request $request, AiProviderService $aiService, UsageService $usageService, \App\Services\TokenDeductionService $tokenDeductionService)
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

        // Cek saldo M_UserQuota dan potong
        if (!$tokenDeductionService->deductQuota($user, 'cost_chat')) {
            return response()->json(['message' => 'Saldo koin/kuota Anda tidak mencukupi untuk menggunakan AI Chat.'], 402);
        }

        $conversationId = $request->conversationId;
        $message = $request->message;
        $messages = $request->messageToAi ?? [];

        // Injeksi Instruksi Sistem untuk Generasi Gambar (Text-to-Image)
        $systemInstruction = "You are an intelligent AI assistant. If the user explicitly asks you to draw, generate, or create an image/picture (e.g., 'gambarkan', 'buatkan gambar', 'draw'), you MUST NOT reply with any explanations, pleasantries, or text. Instead, you MUST reply ONLY with a markdown image tag using Pollinations AI. Use this EXACT format: ![Generated Image](https://image.pollinations.ai/prompt/{detailed-english-description}?width=1024&height=1024&nologo=true&model=flux). Replace {detailed-english-description} with a highly detailed, URL-encoded prompt in English to generate the best image.";
        
        $hasSystem = false;
        foreach ($messages as &$msg) {
            if (($msg['role'] ?? '') === 'system') {
                $msg['content'] = $systemInstruction . "\n\n" . $msg['content'];
                $hasSystem = true;
                break;
            }
        }
        
        if (!$hasSystem) {
            array_unshift($messages, [
                'role' => 'system',
                'content' => $systemInstruction
            ]);
        }

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

        $isVideoRequest = preg_match('/(?:buat|bikin|generate|create).*video/i', $message);
        if ($isVideoRequest) {
            $videoKey = '';
            // Get xAI key specifically, if current provider is not xAI
            if ($provider->M_SettingCode !== 'SETTING-XAI') {
                $xaiProvider = DB::table('m_plansetting as ps')
                    ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
                    ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
                    ->where('s.M_SettingCode', 'SETTING-XAI')
                    ->where('s.M_SettingIsActive', 'Y')
                    ->select('s.M_SettingKey')
                    ->first();
                if ($xaiProvider && !empty($xaiProvider->M_SettingKey)) {
                    $videoKey = $xaiProvider->M_SettingKey;
                }
            } else {
                $videoKey = $provider->M_SettingKey;
            }

            if (!empty($videoKey)) {
                try {
                    $response = $aiService->streamVideoOpenAI($videoKey, $message, $conversationId, $provider->M_SettingCode, 'grok-imagine-video');
                    $usageService->increment($user->M_UserID, $provider->M_SettingCode);
                    return $response;
                } catch (\Throwable $e) {
                    return response()->json([
                        'message' => 'AI Video generation failed',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }
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
            'grok' => fn() => $aiService->streamGrok($provider->M_SettingKey, $provider->M_SettingModel, $messages, false, $conversationId, $provider->M_SettingCode),
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

    public function generateFromFile(Request $request, AiUploadFileService $aiUploadFileService, \App\Services\TokenDeductionService $tokenDeductionService)
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

        // Cek saldo M_UserQuota dan potong
        if (!$tokenDeductionService->deductQuota($user, 'cost_chat')) {
            return response()->json(['message' => 'Saldo koin/kuota Anda tidak mencukupi untuk menggunakan AI Chat.'], 402);
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
            'SETTING-XAI' => 'grok',
            'SETTING-DSK' => 'deepseek',
            'SETTING-QWN' => 'qwen',
        ][$code] ?? null;
    }
}