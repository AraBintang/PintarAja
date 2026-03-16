<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paper;
use App\Models\Prompt;
use App\Models\Section;
use Illuminate\Http\Request;

class PromptController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Prompt::with(['paper', 'section'])
            ->when($search, function ($q) use ($search) {
                $q->where('M_PromptName', 'like', "%{$search}%");
            })
            ->when($request->filled('paperId'), function ($q) use ($request) {
                $q->where('M_PromptM_PaperID', $request->paperId);
            })
            ->when($request->filled('sectionId'), function ($q) use ($request) {
                $q->where('M_PromptM_SectionID', $request->sectionId);
            })
            ->orderBy('M_PromptID', 'desc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $data = collect($paginated->items())->map(function ($prompt) {
            return [
                'id' => $prompt->M_PromptID,
                'name' => $prompt->M_PromptName,
                'value' => $prompt->M_PromptValue,
                'paperId' => $prompt->M_PromptM_PaperID,
                'paperName' => optional($prompt->paper)->M_PaperName,
                'sectionId' => $prompt->M_PromptM_SectionID,
                'sectionName' => optional($prompt->section)->M_SectionName,
                'createdAt' => $prompt->M_PromptCreated,
                'updatedAt' => $prompt->M_PromptLastUpdated,
            ];
        });

        $papers = Paper::select('M_PaperID as id', 'M_PaperName as name')
            ->orderBy('M_PaperName')
            ->get();

        $sections = Section::select('M_SectionID as id', 'M_SectionM_PaperID as paper_id', 'M_SectionName as name')
            ->orderBy('M_SectionName')
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
            'paperId' => 'required|integer',
            'sectionId' => 'required|integer',
            'name' => 'required|string',
            'value' => 'required|string',
        ]);

        Prompt::create([
            'M_PromptM_PaperID' => $validated['paperId'],
            'M_PromptM_SectionID' => $validated['sectionId'],
            'M_PromptName' => $validated['name'],
            'M_PromptValue' => $validated['value'],
            'M_PromptCreated' => now(),
            'M_PromptLastUpdated' => now(),
        ]);

        return response()->json(['message' => 'Prompt created'], 201);
    }

    public function update(Request $request, $id)
    {
        $prompt = Prompt::findOrFail($id);

        $validated = $request->validate([
            'paperId' => 'required|integer',
            'sectionId' => 'required|integer',
            'name' => 'required|string',
            'value' => 'required|string',
        ]);

        $prompt->update([
            'M_PromptM_PaperID' => $validated['paperId'],
            'M_PromptM_SectionID' => $validated['sectionId'],
            'M_PromptName' => $validated['name'],
            'M_PromptValue' => $validated['value'],
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
