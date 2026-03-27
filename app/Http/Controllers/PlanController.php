<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\SettingAI;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Plan::with('aiSettings')
            ->when($search, function ($q) use ($search) {
                $q->where('M_PlanName', 'like', "%{$search}%");
            })
            ->orderBy('M_PlanID', 'asc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $data = $paginated->getCollection()->map(fn($plan) => $this->formatPlan($plan));

        $ai = SettingAI::select('M_SettingID as id', 'M_SettingName as name')->where('M_SettingIsActive', 'Y')->get();

        return response()->json([
            'data' => $data,
            'ai' => $ai,
            'summary' => [
                'total' => Plan::count(),
                'popular' => Plan::where('M_PlanIsPopular', 'Y')->count(),
            ],
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
            'tagLine' => 'required|string',
            'price' => 'required|array',
            'price.weekly' => 'required|numeric|min:0',
            'price.weekly_discount' => 'required|numeric|min:0|max:100',
            'price.monthly' => 'required|numeric|min:0',
            'price.monthly_discount' => 'required|numeric|min:0|max:100',
            'price.yearly' => 'required|numeric|min:0',
            'price.yearly_discount' => 'required|numeric|min:0|max:100',
            'features' => 'required|array',
            'isPopular' => 'required|in:Y,N',
            'aiSettings' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            $plan = Plan::create([
                'M_PlanName' => $validated['name'],
                'M_PlanTagLine' => $validated['tagLine'],
                'M_PlanPrice' => json_encode($validated['price']),
                'M_PlanFeature' => json_encode($validated['features']),
                'M_PlanIsPopular' => $validated['isPopular'],
                'M_PlanCreated' => now(),
                'M_PlanLastUpdated' => now(),
            ]);

            foreach ($validated['aiSettings'] ?? [] as $aiId) {
                DB::table('m_plansetting')->insert([
                    'M_PlanSettingM_PlanID' => $plan->M_PlanID,
                    'M_PlanSettingM_SettingID' => $aiId,
                    'M_PlanSettingCreated' => now(),
                    'M_PlanSettingLastUpdated' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Plan created'], 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string',
            'tagLine' => 'required|string',
            'price' => 'required|array',
            'price.weekly' => 'required|numeric|min:0',
            'price.weekly_discount' => 'required|numeric|min:0|max:100',
            'price.monthly' => 'required|numeric|min:0',
            'price.monthly_discount' => 'required|numeric|min:0|max:100',
            'price.yearly' => 'required|numeric|min:0',
            'price.yearly_discount' => 'required|numeric|min:0|max:100',
            'features' => 'required|array',
            'isPopular' => 'required|in:Y,N',
            'aiSettings' => 'nullable|array',
        ]);

        DB::transaction(function () use ($plan, $validated) {
            $plan->update([
                'M_PlanName' => $validated['name'],
                'M_PlanTagLine' => $validated['tagLine'],
                'M_PlanPrice' => json_encode($validated['price']),
                'M_PlanFeature' => json_encode($validated['features']),
                'M_PlanIsPopular' => $validated['isPopular'],
                'M_PlanLastUpdated' => now(),
            ]);

            DB::table('m_plansetting')
                ->where('M_PlanSettingM_PlanID', $plan->M_PlanID)
                ->delete();

            foreach ($validated['aiSettings'] ?? [] as $aiId) {
                DB::table('m_plansetting')->insert([
                    'M_PlanSettingM_PlanID' => $plan->M_PlanID,
                    'M_PlanSettingM_SettingID' => $aiId,
                    'M_PlanSettingCreated' => now(),
                    'M_PlanSettingLastUpdated' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Plan updated']);
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            DB::table('m_plansetting')->where('M_PlanSettingM_PlanID', $id)->delete();
            Plan::where('M_PlanID', $id)->delete();
        });

        return response()->json(['message' => 'Plan deleted']);
    }

    private function formatPlan(Plan $plan): array
    {
        $raw = json_decode($plan->M_PlanPrice, true) ?? [];

        foreach (['weekly', 'monthly', 'yearly'] as $p) {
            $base = $raw[$p] ?? 0;
            $disc = $raw["{$p}_discount"] ?? 0;
            $raw["{$p}_final"] = $disc > 0
                ? (int) round($base * (1 - $disc / 100))
                : $base;
        }

        return [
            'id' => $plan->M_PlanID,
            'name' => $plan->M_PlanName,
            'tagLine' => $plan->M_PlanTagLine,
            'price' => $raw,
            'features' => json_decode($plan->M_PlanFeature, true),
            'isPopular' => $plan->M_PlanIsPopular,
            'createdAt' => $plan->M_PlanCreated,
            'updatedAt' => $plan->M_PlanLastUpdated,
            'aiSettings' => $plan->aiSettings->map(fn($ai) => [
                'id' => $ai->M_SettingID,
                'name' => $ai->M_SettingName,
            ]),
        ];
    }
}