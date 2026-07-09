<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Humanizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenAI;

class HumanizerController extends Controller
{
    private const FREE_PLAN_ID = 1;
    private const FREE_PLAN_WORD_LIMIT = 250;

    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 15);
        $page = max(1, (int) $request->input('page', 1));
    
        $query = Humanizer::where('M_HumanizerM_UserID', $user->M_UserID)
            ->when($search, fn($q) =>
                $q->where('M_HumanizerName', 'like', "%{$search}%")
            )
            ->orderByDesc('M_HumanizerID');
    
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);
    
        $items = collect($paginated->items())->map(function ($item) {
            $decoded = json_decode($item->M_HumanizerData, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $origin = $decoded['origin'] ?? '';
                $data = $decoded['data'] ?? '';
            } else {
                $origin = '';
                $data = $item->M_HumanizerData;
            }

            return [
                'id' => $item->M_HumanizerID,
                'name' => $item->M_HumanizerName,
                'origin' => $origin,
                'data' => $data,
            ];
        });

        return response()->json([
            'data' => $items,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total'  => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function humanize(Request $request, \App\Services\AiProviderService $aiService, \App\Services\TokenDeductionService $tokenDeductionService)
    {
        try {
            $request->validate([
                'language' => 'required|string',
                'mode' => 'required|string',
                'text' => 'required|string'
            ]);

            $user = $request->user();
            
            $text = trim($request->text);
            $mode = $request->mode;
            $language = $request->language;
            $wordCount = $this->countWords($text);

            if ((int) $user->M_UserPlan === self::FREE_PLAN_ID && $wordCount > self::FREE_PLAN_WORD_LIMIT) {
                return response()->json([
                    'message' => 'Plan gratis hanya bisa memproses maksimal ' . self::FREE_PLAN_WORD_LIMIT . ' kata.',
                ], 422);
            }

            // Cek saldo M_UserQuota dan potong
            if (!$tokenDeductionService->deductQuota($user, 'cost_humanizer')) {
                return response()->json(['message' => 'Saldo koin/kuota Anda tidak mencukupi untuk menggunakan fitur Humanizer.'], 402);
            }

            $providerQuery = DB::table('m_plansetting as ps')
                ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
                ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
                ->where('s.M_SettingIsActive', 'Y')
                ->select('s.M_SettingKey', 's.M_SettingModel', 's.M_SettingCode');

            if ($request->has('providerId') && !empty($request->providerId)) {
                $providerQuery->where('s.M_SettingID', $request->providerId);
            } else {
                $providerQuery->where('s.M_SettingCode', 'SETTING-GPT')->inRandomOrder();
            }

            $provider = $providerQuery->first();

            $apiKey = $provider && !empty($provider->M_SettingKey) ? $provider->M_SettingKey : config('services.openai.key');
            $client = OpenAI::client($apiKey);

            $systemPrompt = "You are an expert human copywriter. Your task is to rewrite the user's text in {$language} so that it completely bypasses AI detectors like Turnitin and GPTZero. Mode: {$mode}.
CRITICAL RULES:
1. Maximize 'perplexity' and 'burstiness'.
2. Use highly varied sentence lengths and structures (mix very short sentences with complex ones).
3. Avoid predictable AI transition words (e.g., 'Furthermore', 'Moreover', 'In conclusion', 'Delve', 'Crucial').
4. Write with a natural human rhythm, incorporating slight imperfections or colloquialisms appropriate for the context.
5. Return ONLY the rewritten text without any quotes, prefaces, or explanations.
Mode notes: basic=natural and human-like; advanced=highly undetectable, maximum burstiness, more varied and nuanced.";

            $model = $provider && !empty($provider->M_SettingModel) ? $provider->M_SettingModel : config('services.openai.paraphrase_model', 'gpt-4o-mini');

            $messages = [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $text,
                ]
            ];

            $response = $aiService->generateText(
                $provider->M_SettingCode ?? 'SETTING-GPT',
                $apiKey,
                $model,
                $messages,
                $this->maxOutputTokens($wordCount, $mode)
            );

            $humanizedText = $response;

            $humanizer = Humanizer::create([
                'M_HumanizerM_UserID' => $user->M_UserID,
                'M_HumanizerName' => 'Humanizer ' . now()->format('Y-m-d H:i'),
                'M_HumanizerData' => json_encode([
                    'origin' => $text,
                    'data' => $humanizedText
                ]),
            ]);

            return response()->json([
                'success' => true,
                'data' => $humanizedText,
                'id' => $humanizer->M_HumanizerID
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Server Error: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    private function countWords(string $text): int
    {
        if ($text === '') {
            return 0;
        }

        return count(preg_split('/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY));
    }

    private function maxOutputTokens(int $wordCount, string $mode): int
    {
        return max(256, min(4096, (int) ceil($wordCount * 2.0 * 1.6)));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
    
        $humanizer = Humanizer::findOrFail($id);
    
        $humanizer->update([
            'M_HumanizerName' => $request->name,
        ]);
    
        return response()->json([
            'message' => 'Updated successfully',
            'data'    => $humanizer,
        ]);
    }

    public function destroy($id)
    {
        $humanizer = Humanizer::findOrFail($id);

         if (!$humanizer) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $humanizer->delete();

        return response()->json([
            'message' => 'Deleted successfully',
            'id' => $id
        ]);
    }
}
