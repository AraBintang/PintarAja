<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\SettingAI;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingAiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');
        $code = $request->input('code');
        $order = in_array(strtolower($request->input('order', 'desc')), ['asc', 'desc'])
            ? $request->input('order', 'desc')
            : 'desc';

        $query = SettingAI::with('plans')
            ->when($search, fn($q) => $q->where(function ($qq) use ($search) {
                $qq->where('M_SettingName', 'like', "%{$search}%")
                   ->orWhere('M_SettingCode', 'like', "%{$search}%");
            }))
            ->when($code, fn($q) => $q->where('M_SettingCode', 'like', "%{$code}%"))
            ->orderBy('M_SettingCreated', $order);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $data = $paginated->getCollection()->map(fn($item) => [
            'id' => $item->M_SettingID,
            'code' => $item->M_SettingCode,
            'name' => $item->M_SettingName,
            'model' => $item->M_SettingModel,
            'apiKey' => $item->M_SettingKey,
            'isActive' => $item->M_SettingIsActive,
            'plans' => $item->plans->map(fn($p) => [
                'id' => $p->M_PlanID,
                'name' => $p->M_PlanName,
            ]),
        ]);

        $summary = [
            'total' => SettingAI::count(),
            'active' => SettingAI::where('M_SettingIsActive', 'Y')->count(),
        ];

        $plans = Plan::query()
            ->select('M_PlanID as id', 'M_PlanName as name')
            ->orderBy('M_PlanID', 'asc')
            ->get();

        return response()->json([
            'data' => $data,
            'summary' => $summary,
            'plans' => $plans,
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
            'code' => 'required|string',
            'name' => 'required|string',
            'model' => 'required|string',
            'key' => 'required|string',
            'planIds' => 'nullable|array',
            'planIds.*' => 'integer',
        ]);

        $ai = SettingAI::create([
            'M_SettingCode' => $validated['code'],
            'M_SettingName' => $validated['name'],
            'M_SettingModel' => $validated['model'],
            'M_SettingKey' => $validated['key'],
            'M_SettingIsActive' => 'Y',
        ]);

        if (!empty($validated['planIds'])) {
            $this->syncPlans($ai->M_SettingID, $validated['planIds']);
        }

        return response()->json(['message' => 'AI created successfully'], 201);
    }

    public function update(Request $request, $id)
    {
        $ai = SettingAI::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'model' => 'required|string',
            'key' => 'required|string',
            'planIds' => 'nullable|array',
            'planIds.*' => 'integer',
        ]);

        DB::transaction(function () use ($ai, $validated) {
            $ai->update([
                'M_SettingCode' => $validated['code'],
                'M_SettingName' => $validated['name'],
                'M_SettingModel' => $validated['model'],
                'M_SettingKey' => $validated['key'],
                'M_SettingLastUpdated' => now(),
            ]);

            $this->syncPlans($ai->M_SettingID, $validated['planIds'] ?? []);
        });

        return response()->json(['message' => 'AI updated successfully']);
    }

    public function activate($id)
    {
        SettingAI::findOrFail($id)->update([
            'M_SettingIsActive'    => 'Y',
            'M_SettingLastUpdated' => now(),
        ]);

        return response()->json(['message' => 'AI activated']);
    }

    public function deactivate($id)
    {
        $ai = SettingAI::findOrFail($id);

        $ai->update([
            'M_SettingIsActive'    => 'N',
            'M_SettingLastUpdated' => now(),
        ]);

        DB::table('m_plansetting')
            ->where('M_PlanSettingM_SettingID', $ai->M_SettingID)
            ->delete();

        return response()->json(['message' => 'AI deactivated']);
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            DB::table('m_plansetting')
                ->where('M_PlanSettingM_SettingID', $id)
                ->delete();

            SettingAI::where('M_SettingID', $id)->delete();
        });

        return response()->json(['message' => 'AI deleted successfully']);
    }

    private function syncPlans(int $settingId, array $planIds): void
    {
        DB::table('m_plansetting')
            ->where('M_PlanSettingM_SettingID', $settingId)
            ->delete();

        if (empty($planIds)) return;

        $rows = array_map(fn($planId) => [
            'M_PlanSettingM_SettingID' => $settingId,
            'M_PlanSettingM_PlanID' => $planId,
        ], $planIds);

        DB::table('m_plansetting')->insert($rows);
    }
}