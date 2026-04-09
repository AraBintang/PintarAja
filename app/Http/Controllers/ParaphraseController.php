<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paraphrase;
use Illuminate\Http\Request;
use OpenAI;

class ParaphraseController extends Controller
{
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

        if ($user->M_UserPlan === 1) {
            return response()->json(['error' => 'Your current plan does not include access to this feature. Please upgrade to continue.'], 403);
        }
        
        $text = $request->text;
        $mode = $request->mode;
        $language = $request->language;

        $client = OpenAI::client(config('services.openai.key'));

        $systemPrompt = "
You are a professional AI paraphrasing assistant.

Your task is to rewrite the user's text while preserving the original meaning.

Instructions:
- Language: {$language}
- Mode: {$mode}

Modes explanation:
- standard: rewrite naturally
- fluency: improve grammar and readability
- formal: academic or professional tone
- academic: rewrite the text in a scholarly and academic tone suitable for essays, research papers, or formal writing
- simple: rewrite the text using simpler words and easier sentence structures so it is easier to understand
- creative: use varied vocabulary
- expand: elaborate the text slightly
- shorten: make the text shorter while keeping meaning

Rules:
- Preserve the original meaning
- Avoid plagiarism
- Improve grammar, spelling, and punctuation
- Correct any grammatical errors
- Follow proper writing standards for the selected language (e.g., EYD/PUEBI for Indonesian)
- Write naturally like a human
- Return ONLY the paraphrased text
- Do not explain anything
";

        $response = $client->responses()->create([
            'model' => 'gpt-4',
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
