<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Paper;
use App\Models\Prompt;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaperController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Paper::with(['sections'])
            ->withCount('prompts as prompt_count')
            ->when($search, function ($q) use ($search) {
                $q->where('M_PaperName', 'like', "%{$search}%");
            })
            ->orderBy('M_PaperID', 'ASC');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $paperIds = collect($paginated->items())->pluck('M_PaperID');

        $sectionPromptCounts = Prompt::whereIn('M_PromptM_SectionID', function ($q) use ($paperIds) {
            $q->select('M_SectionID')
              ->from('m_section')
              ->whereIn('M_SectionM_PaperID', $paperIds);
        })->selectRaw('M_PromptM_SectionID, count(*) as total')
          ->groupBy('M_PromptM_SectionID')
          ->pluck('total', 'M_PromptM_SectionID');

        $data = collect($paginated->items())->map(function ($paper) use ($sectionPromptCounts) {
            return [
                'id' => $paper->M_PaperID,
                'name' => $paper->M_PaperName,
                'prompt_count' => $paper->prompt_count,
                'createdAt' => $paper->M_PaperCreated,
                'updatedAt' => $paper->M_PaperLastUpdated,
                'sections' => $paper->sections->map(function ($s) use ($sectionPromptCounts) {
                    return [
                        'id' => $s->M_SectionID,
                        'name' => $s->M_SectionName,
                        'prompt_count' => $sectionPromptCounts[$s->M_SectionID] ?? 0,
                    ];
                }),
            ];
        });

        $summary = [
            'total' => Paper::count(),
            'sections' => Section::count(),
        ];

        return response()->json([
            'data' => $data,
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
            'name' => 'required|string',
            'sections' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $paper = Paper::create([
                'M_PaperName' => $validated['name'],
                'M_PaperCreated' => now(),
                'M_PaperLastUpdated' => now(),
            ]);

            foreach ($validated['sections'] ?? [] as $sectionName) {
                Section::create([
                    'M_SectionM_PaperID' => $paper->M_PaperID,
                    'M_SectionName' => $sectionName,
                ]);
            }

            DB::commit();

            return response()->json(['message' => 'Paper created'], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $paper = Paper::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'sections' => 'nullable|array',
        ]);

        DB::beginTransaction();

        try {
            $paper->update([
                'M_PaperName' => $validated['name'],
                'M_PaperLastUpdated' => now(),
            ]);

            $existingSections = Section::where('M_SectionM_PaperID', $id)->get();
            $newSections = collect($validated['sections'] ?? []);

            foreach ($existingSections as $section) {
                if (!$newSections->contains($section->M_SectionName)) {
                    $section->delete();
                }
            }

            foreach ($newSections as $sectionName) {
                $exists = $existingSections->firstWhere('M_SectionName', $sectionName);
                if (!$exists) {
                    Section::create([
                        'M_SectionM_PaperID' => $id,
                        'M_SectionName' => $sectionName,
                    ]);
                }
            }

            DB::commit();

            return response()->json(['message' => 'Paper updated']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            Section::where('M_SectionM_PaperID', $id)->delete();
            Paper::where('M_PaperID', $id)->delete();

            DB::commit();

            return response()->json(['message' => 'Paper deleted']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
