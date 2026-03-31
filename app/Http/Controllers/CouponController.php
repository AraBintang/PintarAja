<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Coupons;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $perPage = 10;
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Coupon::query()
            ->leftJoin('m_user', 'm_coupon.M_CouponM_UserID', '=', 'm_user.M_UserID')
            ->leftJoin('m_plan', 'm_coupon.M_CouponM_PlanID', '=', 'm_plan.M_PlanID')
            ->select([
                'm_coupon.M_CouponID as id',
                'm_coupon.M_CouponCode as code',
                'm_coupon.M_CouponDays as days',
                'm_coupon.M_CouponUsed as used',
                'm_coupon.M_CouponUsedDate as usedDate',
                'm_coupon.M_CouponExpired as expired',
                'm_coupon.M_CouponCreated as createdAt',
                'm_user.M_UserEmail as userEmail',
                'm_plan.M_PlanID as planId',
                'm_plan.M_PlanName as planName'
            ])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('m_coupon.M_CouponCode', 'like', "%{$search}%")
                       ->orWhere('m_user.M_UserEmail', 'like', "%{$search}%");
                });
            })
            ->orderBy('m_coupon.M_CouponID', 'desc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $plans = Plan::query()
            ->select('M_PlanID as id', 'M_PlanName as name')
            ->where('M_PlanID', '!=', 1)
            ->orderBy('M_PlanID', 'desc')
            ->get();

        $now = now();

        $summary = [
            'total' => Coupon::count(),
            'used' => Coupon::where('M_CouponUsed', 'Y')->count(),
           'active' => Coupon::where('M_CouponUsed', 'N')
                ->where(function ($q) {
                    $q->whereNull('M_CouponExpired')
                      ->orWhereDate('M_CouponExpired', '>=', now());
                })
                ->count(),
           'expired' => Coupon::where('M_CouponUsed', 'N')
                ->whereNotNull('M_CouponExpired')
                ->whereDate('M_CouponExpired', '<', now())
                ->count(),
        ];

        return response()->json([
            'data' => $paginated->items(),
            'plans' => $plans,
            'summary' => $summary,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage()
            ]
        ]);
    }

    public function generateOneMillion()
    {
        $totalCoupons = 10000; 
        $batchSize = 1000;
        $coupons = [];
        $generatedCodes = [];

        $startTime = microtime(true);

        for ($i = 0; $i < $totalCoupons; $i++) {
            do {
                $code = strtoupper(Str::random(10));
            } while (isset($generatedCodes[$code]));

            $generatedCodes[$code] = true;

            $coupons[] = [
                'M_CouponsCode' => $code,
                'M_CouponsUsed' => 'N',
            ];

            if (count($coupons) >= $batchSize) {
                Coupons::query()->insert($coupons);
                $coupons = [];
            }
        }

        if (!empty($coupons)) {
            Coupons::query()->insert($coupons);
        }

        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);

        return response()->json([
            'message' => 'Successfully generate 10.000 coupons!',
            'duration_seconds' => $duration,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'planId' => 'required|integer',
            'days' => 'required|integer',
            'expired' => 'required|date',
            'count' => 'required|integer|min:1'
        ]);

        DB::beginTransaction();

        try {
            $codes = Coupons::where('M_CouponsUsed', 'N')
                ->limit($validated['count'])
                ->get();

            if ($codes->isEmpty()) {
                return response()->json(['message' => 'No available coupon codes'], 400);
            }

            $insert = [];
            $updateIds = [];

            foreach ($codes as $code) {
                $insert[] = [
                    'M_CouponM_PlanID' => $validated['planId'],
                    'M_CouponDays' => $validated['days'],
                    'M_CouponCode' => $code->M_CouponsCode,
                    'M_CouponExpired' => $validated['expired']
                ];

                $updateIds[] = $code->M_CouponsID;
            }

            Coupon::insert($insert);

            Coupons::whereIn('M_CouponsID', $updateIds)->update(['M_CouponsUsed' => 'Y']);

            DB::commit();

            return response()->json([
                'message' => 'Coupons generated successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);

        Coupons::where('M_CouponsCode', $coupon->M_CouponCode)
            ->update([
                'M_CouponsUsed' => 'N',
                'M_CouponsLastUpdated' => now()
            ]);

        $coupon->delete();

        return response()->json([
            'message' => 'Coupon deleted'
        ]);
    }
}