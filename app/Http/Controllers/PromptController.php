<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paper;
use App\Models\Prompt;
use App\Models\Section;
use Illuminate\Http\Request;

class PromptController extends Controller
{
    private const PROMPT_FOR_OPTIONS = ['writer', 'chat', 'both'];

    private function normalizePromptFor(?string $value): string
    {
        return in_array($value, self::PROMPT_FOR_OPTIONS, true) ? $value : 'writer';
    }

    public function index(Request $request)
    {
        $custom = $request->input('custom');
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Prompt::with(['paper', 'section'])
            ->when($custom === 'true', function ($q) {
                $q->where('M_PromptM_UserID', auth()->id());
            }, function ($q) {
                $q->whereNull('M_PromptM_UserID');
            })
            ->when($search, function ($q) use ($search) {
                $q->where('M_PromptName', 'like', "%{$search}%");
            })
            ->when($request->filled('paperId'), function ($q) use ($request) {
                $q->where('M_PromptM_PaperID', $request->paperId);
            })
            ->when($request->filled('sectionId'), function ($q) use ($request) {
                $q->where('M_PromptM_SectionID', $request->sectionId);
            })
            ->when($request->filled('promptFor'), function ($q) use ($request) {
                $promptFor = $this->normalizePromptFor($request->input('promptFor'));

                $q->where(function ($query) use ($promptFor) {
                    $query->where('M_PromptFor', $promptFor)
                        ->orWhere('M_PromptFor', 'both');

                    if ($promptFor === 'writer') {
                        $query->orWhereNull('M_PromptFor');
                    }
                });
            })
            ->orderBy('M_PromptID', 'DESC');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $data = collect($paginated->items())->map(function ($prompt) {
            return [
                'id' => $prompt->M_PromptID,
                'name' => $prompt->M_PromptName,
                'value' => $prompt->M_PromptValue,
                'promptFor' => $prompt->M_PromptFor ?: 'writer',
                'paperId' => $prompt->M_PromptM_PaperID,
                'paperName' => optional($prompt->paper)->M_PaperName,
                'sectionId' => $prompt->M_PromptM_SectionID,
                'sectionName' => optional($prompt->section)->M_SectionName,
                'createdAt' => $prompt->M_PromptCreated,
                'updatedAt' => $prompt->M_PromptLastUpdated,
            ];
        });

        if ($request->input('view') === 'writer') {
            return response()->json([
                'data' => $data,
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                    'last_page' => $paginated->lastPage(),
                ],
            ]);
        }

        $papers = Paper::select('M_PaperID as id', 'M_PaperName as name')
            ->orderBy('M_PaperName')
            ->get();

        $sections = Section::select('M_SectionID as id', 'M_SectionM_PaperID as paper_id', 'M_SectionName as name')
            ->orderBy('M_SectionID', 'asc')
            ->get();

        $summary = [
            'total' => Prompt::count(),
            'papers' => Paper::count(),
        ];

        return response()->json([
            'data' => $data,
            'papers' => $papers,
            'sections' => $sections,
            'summary' => $summary,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'custom' => 'sometimes|boolean',
            'name' => 'required|string',
            'paperId' => 'nullable|integer',
            'sectionId' => 'nullable|integer',
            'value' => 'required|string',
            'promptFor' => 'nullable|in:writer,chat,both',
        ]);

        $userId = null;

        if ($request->custom) {
            $userId = auth()->id();
        }

        Prompt::create([
            'M_PromptM_UserID' =>  $userId,
            'M_PromptM_PaperID' => $validated['paperId'] ?? 0,
            'M_PromptM_SectionID' => $validated['sectionId'] ?? 0,
            'M_PromptName' => $validated['name'],
            'M_PromptValue' => $validated['value'],
            'M_PromptFor' => $this->normalizePromptFor($validated['promptFor'] ?? null),
            'M_PromptCreated' => now(),
            'M_PromptLastUpdated' => now(),
        ]);

        return response()->json(['message' => 'Prompt created'], 201);
    }

    public function update(Request $request, $id)
    {
        $prompt = Prompt::findOrFail($id);

        $validated = $request->validate([
            'paperId' => 'nullable|integer',
            'sectionId' => 'nullable|integer',
            'name' => 'required|string',
            'value' => 'required|string',
            'promptFor' => 'nullable|in:writer,chat,both',
        ]);

        $prompt->update([
            'M_PromptM_PaperID' => $validated['paperId'] ?? 0,
            'M_PromptM_SectionID' => $validated['sectionId'] ?? 0,
            'M_PromptName' => $validated['name'],
            'M_PromptValue' => $validated['value'],
            'M_PromptFor' => $this->normalizePromptFor($validated['promptFor'] ?? null),
            'M_PromptLastUpdated' => now(),
        ]);

        return response()->json(['message' => 'Prompt updated']);
    }

    public function destroy($id)
    {
        Prompt::findOrFail($id)->delete();

        return response()->json(['message' => 'Prompt deleted']);
    }
}
