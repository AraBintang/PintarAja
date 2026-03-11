<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
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
        $order = in_array(strtolower($request->input('order')), ['asc', 'desc'])
            ? $request->input('order')
            : 'desc';

        $query = SettingAI::with('plans')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('M_SettingName', 'like', "%$search%")
                      ->orWhere('M_SettingCode', 'like', "%$search%");
                });
            })
            ->when($code, function ($q) use ($code) {
                $q->where('M_SettingCode', 'like', "%{$code}%");
            })
            ->orderBy('M_SettingCreated', $order);

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $data = $paginated->getCollection()->map(function ($item) {
            return [
                'id' => $item->M_SettingID,
                'code' => $item->M_SettingCode,
                'name' => $item->M_SettingName,
                'model' => $item->M_SettingModel,
                'apiKey' => $item->M_SettingKey,
                'isActive' => $item->M_SettingIsActive,
                'plans' => $item->plans->map(function ($p) {
                    return [
                        'id' => $p->M_PlanID,
                        'name' => $p->M_PlanName
                    ];
                })
            ];
        });

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'model' => 'required|string',
            'key' => 'required|string',
        ]);

        $ai = SettingAI::create([
            'M_SettingCode' => $validated['code'],
            'M_SettingName' => $validated['name'],
            'M_SettingModel' => $validated['model'],
            'M_SettingKey' => $validated['key'],
            'M_SettingIsActive' => 'Y',
        ]);

        return response()->json([
            'message' => 'AI created and activated',
            'data' => $ai
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ai = SettingAI::findOrFail($id);

        $validated = $request->validate([
            'code' => 'required|string',
            'name' => 'required|string',
            'model' => 'required|string',
            'key' => 'required|string',
        ]);

        DB::transaction(function () use ($ai, $validated) {
            $ai->update([
                'M_SettingCode' => $validated['code'],
                'M_SettingName' => $validated['name'],
                'M_SettingModel' => $validated['model'],
                'M_SettingKey' => $validated['key'],
                'M_SettingLastUpdated' => now(),
            ]);
        });

        return response()->json([
            'message' => 'AI updated successfully',
            'data' => $ai
        ]);
    }

    public function activate($id)
    {
        $ai = SettingAI::findOrFail($id);

        $ai->update([
            'M_SettingIsActive' => 'Y',
            'M_SettingLastUpdated' => now(),
        ]);

        return response()->json([
            'message' => 'AI activated'
        ]);
    }

    public function deactivate($id)
    {
        $ai = SettingAI::findOrFail($id);

        $ai->update([
            'M_SettingIsActive' => 'N',
            'M_SettingLastUpdated' => now(),
        ]);

        DB::table('m_plansetting')
            ->where('M_PlanSettingM_SettingID', $ai->M_SettingID)
            ->delete();

        return response()->json([
            'message' => 'AI deactivated'
        ]);
    }

    public function destroy($id)
    {
        DB::transaction(function () use ($id) {
            DB::table('m_plansetting')
                ->where('M_PlanSettingM_SettingID', $id)
                ->delete();

            SettingAI::where('M_SettingID', $id)->delete();
        });

        return response()->json([
            'message' => 'AI deleted successfully'
        ]);
    }
}