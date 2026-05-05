<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Paper;
use App\Models\Section;
use App\Models\UserFile;
use App\Models\Workbook;
use App\Services\AiProviderService;
use App\Services\UsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class WriterController extends Controller
{
    public function index(Request $request, UsageService $usageService)
    {
        $user = $request->user();
    
        if (!$user) {
            return response()->json(['message' => 'User authentication failed.'], 401);
        }
    
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 15);
        $page = max(1, (int) $request->input('page', 1));
    
        $papers = Paper::select('M_PaperID as id', 'M_PaperName as name')
            ->orderBy('M_PaperName')->get();
    
        $sections = Section::select('M_SectionID as id', 'M_SectionM_PaperID as paper_id', 'M_SectionName as name')
            ->orderBy('M_SectionID', 'asc')->get();
    
        $aiProviders = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingIsActive', 'Y')
            ->select(
              's.M_SettingID as id',
              's.M_SettingCode as code',
              's.M_SettingModel as model',
              's.M_SettingModel as label',
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
    
        $workbooks = Workbook::where('M_WorkbookM_UserID', $user->M_UserID)
            ->select('M_WorkbookID as id', 'M_WorkbookName as name')
            ->orderBy('M_WorkbookName')->get();
    
        $documentQuery = Document::where('m_document.M_DocumentM_UserID', $user->M_UserID)
            ->leftJoin('m_workbook', 'm_workbook.M_WorkbookID', '=', 'm_document.M_DocumentM_WorkbookID')
            ->select(
                'm_document.M_DocumentID as id',
                'm_document.M_DocumentM_WorkbookID as workbook_id',
                'm_document.M_DocumentName as title',
                'm_document.M_DocumentPromptData as input',
                'm_document.M_DocumentResult as result',
                'm_document.M_DocumentCitations as citations',
                'm_document.M_DocumentFileInfo as fileInfo',
                'm_workbook.M_WorkbookName as workbook',
                'm_document.M_DocumentLastUpdated as lastEdited'
            )
            ->when($search, fn($q) =>
                $q->where('m_document.M_DocumentName', 'like', "%{$search}%")
            )
            ->orderBy('m_document.M_DocumentLastUpdated', 'desc');
    
        $paginated = $documentQuery->paginate($perPage, ['*'], 'page', $page);
    
        return response()->json([
            'papers' => $papers,
            'sections' => $sections,
            'ai' => $aiProviders,
            'quota' => $usageService->getQuotaByUser($user->M_UserID),
            'workbooks' => $workbooks,
            'documents' => $paginated->items(),
            'pagination'=> [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function uploadFile(Request $request)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'file' => 'required|file|max:20480',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User authentication failed.'], 401);
        }

        $provider = $this->resolveProvider($user, $request->providerId);
        if (!$provider) {
            return response()->json(['message' => 'Provider tidak tersedia untuk plan Anda.'], 403);
        }

        if ($provider->M_SettingCode !== 'SETTING-GPT') {
            return response()->json(['message' => 'File upload hanya tersedia untuk model OpenAI (GPT).'], 400);
        }

        $apiKey = $provider->M_SettingKey;
        if (empty($apiKey)) {
            return response()->json(['message' => 'API key tidak ditemukan.'], 500);
        }

        $file = $request->file('file');

        $existingTotalSize = UserFile::where('M_UserFileM_UserID', $user->M_UserID)->sum('M_UserFileSize');
        if ($existingTotalSize + $file->getSize() > 500 * 1024 * 1024) {
            return response()->json(['message' => 'Total ukuran file tidak boleh melebihi 500MB.'], 400);
        }

        try {
            $uploadRes = Http::withToken($apiKey)
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName(), [
                    'Content-Type' => $file->getMimeType(),
                ])
                ->post('https://api.openai.com/v1/files', ['purpose' => 'assistants']);

            if (!$uploadRes->successful()) {
                return response()->json([
                    'message' => 'Gagal upload file ke OpenAI.',
                    'detail' => $uploadRes->body(),
                ], 500);
            }

            $fileId = $uploadRes->json('id');

            for ($i = 0; $i < 20; $i++) {
                $statusRes = Http::withToken($apiKey)->get("https://api.openai.com/v1/files/{$fileId}");
                if ($statusRes->json('status') === 'processed') break;
                sleep(1);
            }

            $vsRes = Http::withToken($apiKey)->post('https://api.openai.com/v1/vector_stores', [
                'name' => 'writer_ref_' . $user->M_UserID . '_' . time(),
                'file_ids' => [$fileId],
            ]);

            if (!$vsRes->successful()) {
                Http::withToken($apiKey)->delete("https://api.openai.com/v1/files/{$fileId}");
                return response()->json([
                    'message' => 'Gagal membuat vector store.',
                    'detail' => $vsRes->body(),
                ], 500);
            }

            $vectorStoreId = $vsRes->json('id');

            $maxAttempts = 20;
            $delay = 1;
            $ready = false;
 
            for ($i = 0; $i < $maxAttempts; $i++) {
                sleep($delay);
 
                $vsStatus = Http::withToken($apiKey)->get("https://api.openai.com/v1/vector_stores/{$vectorStoreId}");
                $status = $vsStatus->json('status');
                $counts = $vsStatus->json('file_counts') ?? [];
                $inProg = $counts['in_progress'] ?? 1;
                $completed = $counts['completed']  ?? 0;
                $total = $counts['total'] ?? 0;
 
                if ($status === 'completed' && $total > 0 && $inProg === 0 && $completed === $total) {
                    $ready = true;
                    break;
                }
 
                $delay = min(2, $delay * 2);
            }

            $userFile = UserFile::create([
                'M_UserFileM_UserID' => $user->M_UserID,
                'M_UserFileM_PlanSettingID' => $request->providerId,
                'M_UserFileName' => $file->getClientOriginalName(),
                'M_UserFileMime' => $file->getMimeType(),
                'M_UserFileSize' => $file->getSize(),
                'M_UserFileStatus' => 'ready',
                'M_UserFileOpenAiFileId' => $fileId,
                'M_UserFileVectorStoreId' => $vectorStoreId,
                'M_UserFileCreated' => now(),
                'M_UserFileLastUpdated' => now(),
            ]);

            return response()->json([
                'id' => $userFile->M_UserFileID,
                'fileId' => $fileId,
                'vectorStoreId' => $vectorStoreId,
                'fileName' => $userFile->M_UserFileName,
                'fileSize' => $userFile->M_UserFileSize,
                'status' => $userFile->M_UserFileStatus,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload file gagal.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deleteFile(Request $request)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'fileId' => 'required|string',
            'vectorStoreId' => 'required|string',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User authentication failed.'], 401);
        }

        $provider = $this->resolveProvider($user, $request->providerId);
        if (!$provider) {
            return response()->json(['message' => 'Provider tidak tersedia.'], 403);
        }

        $apiKey = $provider->M_SettingKey;
        $errors = [];

        try {
            Http::withToken($apiKey)->delete("https://api.openai.com/v1/vector_stores/{$request->vectorStoreId}");
        } catch (\Exception $e) {
            $errors[] = 'vector_store: ' . $e->getMessage();
        }

        try {
            Http::withToken($apiKey)->delete("https://api.openai.com/v1/files/{$request->fileId}");
        } catch (\Exception $e) {
            $errors[] = 'file: ' . $e->getMessage();
        }

        if (!empty($errors)) {
            return response()->json(['message' => 'Sebagian penghapusan gagal.', 'errors' => $errors], 207);
        }

        UserFile::where('M_UserFileM_UserID', $user->M_UserID)
            ->where('M_UserFileOpenAiFileId', $request->fileId)
            ->where('M_UserFileVectorStoreId', $request->vectorStoreId)
            ->delete();

        return response()->json(['message' => 'File dan vector store berhasil dihapus.']);
    }

    public function files(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User authentication failed.'], 401);
        }
 
        $perPage = (int) $request->get('per_page', 5);
        $page = (int) $request->get('page', 1);
        $search = $request->get('search', '');
 
        $query = UserFile::where('M_UserFileM_UserID', $user->M_UserID);
 
        if ($search) {
            $query->where('M_UserFileName', 'like', '%' . $search . '%');
        }
 
        $query->orderBy('M_UserFileCreated', 'desc');
 
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);
 
        $files = $paginated->getCollection()->map(fn($f) => [
            'id' => $f->M_UserFileID,
            'providerId' => $f->M_UserFileM_PlanSettingID,
            'name' => $f->M_UserFileName,
            'mime' => $f->M_UserFileMime,
            'size' => $f->M_UserFileSize,
            'status' => $f->M_UserFileStatus,
            'fileId' => $f->M_UserFileOpenAiFileId,
            'vectorStoreId' => $f->M_UserFileVectorStoreId,
            'createdAt' => $f->M_UserFileCreated,
        ]);
 
        $usedStorage = UserFile::where('M_UserFileM_UserID', $user->M_UserID)->sum('M_UserFileSize');
        $remainingStorage = max(0, 500 * 1024 * 1024 - $usedStorage);
 
        return response()->json([
            'files' => $files,
            'quota' => [
                'limit' => 500 * 1024 * 1024,
                'used' => $usedStorage,
                'remaining' => $remainingStorage,
                'count' => UserFile::where('M_UserFileM_UserID', $user->M_UserID)->count(),
            ],
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function generate(Request $request, AiProviderService $aiService, UsageService $usageService)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'message' => 'required|string',
            'vectorStoreId' => 'nullable|string',
            'vectorStoreIds' => 'nullable|array',
            'vectorStoreIds.*' => 'string',
        ]);
 
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'User authentication failed.'], 401);
        }
 
        $provider = $this->resolveProvider($user, $request->providerId);
        if (!$provider) {
            return response()->json(['message' => 'You are not allowed to use this AI provider with your current subscription plan.'], 403);
        }
 
        if (empty($provider->M_SettingKey)) {
            return response()->json(['message' => 'AI provider configuration is missing API key.'], 500);
        }

        if (!$usageService->checkQuota($user->M_UserID, $provider->M_SettingCode)) {
            return response()->json([
                'message' => 'Batas penggunaan harian tercapai. Coba lagi besok.',
                'quota_remaining' => 0,
            ], 429);
        }
 
        $providerMap = [
            'SETTING-GPT' => 'openai',
            'SETTING-GMN' => 'gemini',
            'SETTING-CLD' => 'claude',
            'SETTING-XAI' => 'grok',
            'SETTING-DSK' => 'deepseek',
            'SETTING-QWN' => 'qwen',
        ];
 
        $aiName = $providerMap[$provider->M_SettingCode] ?? null;
        if (!$aiName) {
            return response()->json(['message' => 'Unknown AI provider configuration.'], 400);
        }
 
        $vectorStoreIds = [];
        if ($request->filled('vectorStoreIds')) {
            $vectorStoreIds = array_filter($request->vectorStoreIds);
        } elseif ($request->filled('vectorStoreId')) {
            $vectorStoreIds = [$request->vectorStoreId];
        }
        $vectorStoreIds = array_values(array_unique($vectorStoreIds));
 
        try {
            if ($aiName === 'openai' && !empty($vectorStoreIds)) {
                return $this->streamOpenAIWithFileSearch(
                    $provider->M_SettingKey,
                    $provider->M_SettingModel ?? 'gpt-4o',
                    $request->message,
                    $vectorStoreIds
                );
            }
 
            $handlers = [
                'openai' => fn() => $aiService->streamOpenAI($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'gemini' => fn() => $aiService->streamGemini($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'claude' => fn() => $aiService->streamClaude($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'grok' => fn() => $aiService->streamGrok($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'deepseek' => fn() => $aiService->streamDeepSeek($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'qwen' => fn() => $aiService->streamQwen($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
            ];
 
            if (!isset($handlers[$aiName])) {
                return response()->json(['message' => "AI handler for {$aiName} is not implemented."], 500);
            }

            $result = $handlers[$aiName]();
        
            $usageService->increment($user->M_UserID, $provider->M_SettingCode);
 
            return $result;
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI request failed.', 'error' => $e->getMessage()], 500);
        }
    }
 
    private function streamOpenAIWithFileSearch(
        string $apiKey,
        string $model,
        string $message,
        array  $vectorStoreIds
    ) {
        return response()->stream(function () use ($apiKey, $model, $message, $vectorStoreIds) {
            $payload = [
                'model' => $model,
                'stream' => true,
                'input' => [
                    ['role' => 'user', 'content' => $message],
                ],
                'tools'  => [[
                    'type' => 'file_search',
                    'vector_store_ids' => $vectorStoreIds,
                ]],
            ];
 
            $response = Http::withToken($apiKey)
                ->withOptions(['stream' => true])
                ->post('https://api.openai.com/v1/responses', $payload);
 
            $body = $response->getBody();
            $annotations = [];
            $buffer = '';
 
            while (!$body->eof()) {
                $buffer .= $body->read(1024);
 
                while (($pos = strpos($buffer, "\n")) !== false) {
                    $line   = trim(substr($buffer, 0, $pos));
                    $buffer = substr($buffer, $pos + 1);
 
                    if (!str_starts_with($line, 'data: ') || $line === 'data: [DONE]') continue;
 
                    try {
                        $json = json_decode(substr($line, 6), true);
                        $type = $json['type'] ?? '';
 
                        if ($type === 'response.output_text.delta') {
                            $delta = $json['delta'] ?? '';
                            if ($delta) {
                                echo $delta;
                                ob_flush();
                                flush();
                            }
                        }
 
                        if ($type === 'response.output_item.done') {
                            foreach ($json['item']['content'] ?? [] as $content) {
                                foreach ($content['annotations'] ?? [] as $ann) {
                                    if (($ann['type'] ?? '') === 'file_citation') {
                                        $annotations[] = [
                                            'file_id' => $ann['file_id']  ?? '',
                                            'filename' => $ann['filename'] ?? '',
                                            'index' => $ann['index']    ?? 0,
                                        ];
                                    }
                                }
                            }
                        }
                    } catch (\Throwable $_) {
                    }
                }
            }
 
            $annotations = array_values(
                array_reduce($annotations, function ($carry, $ann) {
                    $carry[$ann['file_id']] = $ann;
                    return $carry;
                }, [])
            );
 
            if (!empty($annotations)) {
                echo "\n\n<!--CITATIONS:" . json_encode($annotations) . "-->";
                ob_flush();
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
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
}