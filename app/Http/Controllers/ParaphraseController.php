<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paraphrase;
use Illuminate\Http\Request;
use OpenAI;

class ParaphraseController extends Controller
{
    private const FREE_PLAN_ID = 1;
    private const FREE_PLAN_WORD_LIMIT = 125;

    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 15);
        $page = max(1, (int) $request->input('page', 1));
    
        $query = Paraphrase::select([
                'M_ParaphraseID as id',
                'M_ParaphraseName as name',
                'M_ParaphraseOrigin as origin',
                'M_ParaphraseData as data',
            ])
            ->where('M_ParaphraseM_UserID', $user->M_UserID)
            ->when($search, fn($q) =>
                $q->where('M_ParaphraseName', 'like', "%{$search}%")
            )
            ->orderByDesc('M_ParaphraseID');
    
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);
    
        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total'  => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function paraphrase(Request $request)
    {
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
                'message' => 'Plan gratis hanya bisa memparafrase maksimal ' . self::FREE_PLAN_WORD_LIMIT . ' kata.',
            ], 422);
        }

        $client = OpenAI::client(config('services.openai.key'));

        $systemPrompt = "Paraphrase the user's text in {$language}. Mode: {$mode}. Preserve meaning, improve grammar/spelling/punctuation, write naturally, and return only the paraphrased text. Mode notes: standard=natural rewrite; fluency=readability; formal=professional; academic=scholarly; simple=easier wording; creative=varied vocabulary; expand=slightly elaborate; shorten=shorter with same meaning.";

        $response = $client->responses()->create([
            'model' => config('services.openai.paraphrase_model', 'gpt-4o-mini'),
            'max_output_tokens' => $this->maxOutputTokens($wordCount, $mode),
            'input' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt,
                ],
                [
                    'role' => 'user',
                    'content' => $text,
                ]
            ]
        ]);

        $paraphrase = $response->outputText ?? data_get($response, 'output.1.content.0.text') ?? data_get($response, 'output.0.content.0.text', '');

        $paraphraseId = Paraphrase::create([
            'M_ParaphraseM_UserID' => $user->M_UserID,
            'M_ParaphraseName' => 'Paraphrase ' . now()->format('Y-m-d H:i'),
            'M_ParaphraseOrigin' => $text,
            'M_ParaphraseData' => $paraphrase,
        ]);

        return response()->json([
            'success' => true,
            'data' => $paraphrase,
            'id' => $paraphraseId->M_ParaphraseID
        ]);
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
        $multiplier = strtolower($mode) === 'expand' ? 3.0 : 2.0;

        return max(256, min(4096, (int) ceil($wordCount * $multiplier * 1.6)));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
    
        $paraphrase = Paraphrase::findOrFail($id);
    
        $paraphrase->update([
            'M_ParaphraseName' => $request->name,
        ]);
    
        return response()->json([
            'message' => 'Updated successfully',
            'data' => $paraphrase,
        ]);
    }

    public function destroy($id)
    {
        $paraphrase = Paraphrase::findOrFail($id);

         if (!$paraphrase) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $paraphrase->delete();

        return response()->json([
            'message' => 'Deleted successfully',
            'id' => $id
        ]);
    }
}
