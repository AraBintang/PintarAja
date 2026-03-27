<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Paper;
use App\Models\Section;
use App\Models\Workbook;
use App\Services\AiProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class WriterController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User authentication failed.'
            ], 401);
        }

        $papers = Paper::select(
            'M_PaperID as id',
            'M_PaperName as name'
        )->orderBy('M_PaperName')->get();

        $sections = Section::select(
            'M_SectionID as id',
            'M_SectionM_PaperID as paper_id',
            'M_SectionName as name'
        )->orderBy('M_SectionName')->get();

        $aiProviders = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingIsActive', 'Y')
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

        $workbooks = Workbook::where('M_WorkbookM_UserID', $user->M_UserID)
            ->select(
                'M_WorkbookID as id',
                'M_WorkbookName as name'
            )
            ->orderBy('M_WorkbookName')
            ->get();

        $documents = Document::where('M_DocumentM_UserID', $user->M_UserID)
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
            ->orderBy('m_document.M_DocumentLastUpdated', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'papers' => $papers,
            'sections' => $sections,
            'ai' => $aiProviders,
            'workbooks' => $workbooks,
            'documents' => $documents,
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

        try {
            $uploadRes = Http::withToken($apiKey)
                ->attach('file', file_get_contents($file->getRealPath()), $file->getClientOriginalName(), [
                    'Content-Type' => $file->getMimeType(),
                ])
                ->post('https://api.openai.com/v1/files', ['purpose' => 'assistants']);

            if (!$uploadRes->successful()) {
                return response()->json([
                    'message' => 'Gagal upload file ke OpenAI.',
                    'detail'  => $uploadRes->body(),
                ], 500);
            }

            $fileId = $uploadRes->json('id');

            for ($i = 0; $i < 20; $i++) {
                $statusRes = Http::withToken($apiKey)->get("https://api.openai.com/v1/files/{$fileId}");
                if ($statusRes->json('status') === 'processed') break;
                sleep(1);
            }

            $vsRes = Http::withToken($apiKey)->post('https://api.openai.com/v1/vector_stores', [
                'name'     => 'writer_ref_' . $user->M_UserID . '_' . time(),
                'file_ids' => [$fileId],
            ]);

            if (!$vsRes->successful()) {
                Http::withToken($apiKey)->delete("https://api.openai.com/v1/files/{$fileId}");
                return response()->json([
                    'message' => 'Gagal membuat vector store.',
                    'detail'  => $vsRes->body(),
                ], 500);
            }

            $vectorStoreId = $vsRes->json('id');

            for ($i = 0; $i < 30; $i++) {
                $vsStatus = Http::withToken($apiKey)->get("https://api.openai.com/v1/vector_stores/{$vectorStoreId}");
                $status = $vsStatus->json('status');
                $counts = $vsStatus->json('file_counts');
                $inProgress = $counts['in_progress'] ?? 1;
                $completed = $counts['completed']   ?? 0;
                $total = $counts['total']        ?? 0;

                if ($status === 'completed' && $total > 0 && $inProgress === 0 && $completed === $total) {
                    break;
                }
                sleep(1);
            }

            return response()->json([
                'fileId' => $fileId,
                'vectorStoreId' => $vectorStoreId,
                'fileName' => $file->getClientOriginalName(),
                'fileSize' => $file->getSize(),
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

        return response()->json(['message' => 'File dan vector store berhasil dihapus.']);
    }

    public function generate(Request $request, AiProviderService $aiService)
    {
        $request->validate([
            'providerId' => 'required|integer',
            'message' => 'required|string',
            'vectorStoreId' => 'nullable|string',
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

        $providerMap = [
            'SETTING-GPT' => 'OpenAI',
            'SETTING-CLD' => 'Claude',
            'SETTING-GMN' => 'Gemini',
            'SETTING-DSK' => 'DeepSeek',
            'SETTING-QWN' => 'Qwen',
        ];

        $aiName = $providerMap[$provider->M_SettingCode] ?? null;
        if (!$aiName) {
            return response()->json(['message' => 'Unknown AI provider configuration.'], 400);
        }

        $vectorStoreId = $request->vectorStoreId;

        try {
            if ($aiName === 'OpenAI' && !empty($vectorStoreId)) {
                return $this->streamOpenAIWithFileSearch(
                    $provider->M_SettingKey,
                    $provider->M_SettingModel ?? 'gpt-4o',
                    $request->message,
                    $vectorStoreId
                );
            }

            $handlers = [
                'OpenAI' => fn() => $aiService->streamOpenAI($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Gemini' => fn() => $aiService->streamGemini($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'DeepSeek' => fn() => $aiService->streamDeepSeek($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Claude' => fn() => $aiService->streamClaude($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Qwen' => fn() => $aiService->streamQwen($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
            ];

            if (!isset($handlers[$aiName])) {
                return response()->json(['message' => "AI handler for {$aiName} is not implemented."], 500);
            }

            return $handlers[$aiName]();
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI request failed.', 'error' => $e->getMessage()], 500);
        }
    }

    private function streamOpenAIWithFileSearch(string $apiKey, string $model, string $message, string $vectorStoreId)
    {
        return response()->stream(function () use ($apiKey, $model, $message, $vectorStoreId) {
            $payload = [
                'model' => $model,
                'stream' => true,
                'input' => [
                    ['role' => 'user', 'content' => $message],
                ],
                'tools' => [[
                    'type' => 'file_search',
                    'vector_store_ids' => [$vectorStoreId],
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