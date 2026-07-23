<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Coupons;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = Coupon::query()
            ->leftJoin('m_user as creator', 'm_coupon.M_CouponCreatedBy', '=', 'creator.M_UserID')
            ->leftJoin('m_user as redeemer', 'm_coupon.M_CouponM_UserID', '=', 'redeemer.M_UserID')
            ->leftJoin('m_plan', 'm_coupon.M_CouponM_PlanID', '=', 'm_plan.M_PlanID')
            ->leftJoin(
                DB::raw('(SELECT M_RedemptionCouponID, COUNT(*) as redeem_count FROM m_coupon_redemption GROUP BY M_RedemptionCouponID) as r'),
                'r.M_RedemptionCouponID', '=', 'm_coupon.M_CouponID'
            )
            ->select([
                'm_coupon.M_CouponID as id',
                'm_coupon.M_CouponCode as code',
                'm_coupon.M_CouponDays as days',
                'm_coupon.M_CouponUsed as used',
                'm_coupon.M_CouponUsedDate as usedDate',
                'm_coupon.M_CouponExpired as expired',
                'm_coupon.M_CouponCreated as createdAt',
                'm_coupon.M_CouponMaxUses as maxUses',
                'creator.M_UserEmail as creatorEmail',
                'redeemer.M_UserEmail as redeemerEmail',
                'm_plan.M_PlanID as planId',
                'm_plan.M_PlanName as planName',
                DB::raw('COALESCE(r.redeem_count, 0) as usedCount'),
            ])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('m_coupon.M_CouponCode', 'like', "%{$search}%")
                       ->orWhere('m_user.M_UserEmail',  'like', "%{$search}%");
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
 
            'used' => Coupon::whereNull('M_CouponMaxUses')
                ->where('M_CouponUsed', 'Y')
                ->count(),
 
            'exhausted' => Coupon::whereNotNull('M_CouponMaxUses')
                ->whereRaw('(SELECT COUNT(*) FROM m_coupon_redemption WHERE M_RedemptionCouponID = m_coupon.M_CouponID) >= m_coupon.M_CouponMaxUses')
                ->count(),
 
            'active' => Coupon::where(function ($q) {
                    $q->whereNull('M_CouponExpired')
                      ->orWhereDate('M_CouponExpired', '>=', now());
                })
                ->where(function ($q) {
                    $q->where(function ($qq) {
                        $qq->whereNull('M_CouponMaxUses')
                           ->where('M_CouponUsed', 'N');
                    })
                    ->orWhere(function ($qq) {
                        $qq->whereNotNull('M_CouponMaxUses')
                           ->whereRaw('(SELECT COUNT(*) FROM m_coupon_redemption WHERE M_RedemptionCouponID = m_coupon.M_CouponID) < m_coupon.M_CouponMaxUses');
                    })
                    ->orWhere(function ($qq) {
                        $qq->where('M_CouponMaxUses', 0);
                    });
                })
                ->count(),
 
            'expired' => Coupon::whereNotNull('M_CouponExpired')
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
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'planId' => 'required|integer|exists:m_plan,M_PlanID',
            'days' => 'required|integer|min:1',
            'expired' => 'required|date|after:today',
            'codeMode' => 'required|in:auto,custom',
            'customCode' => 'required_if:codeMode,custom|nullable|string|max:32|alpha_num',
            'count' => 'required_if:codeMode,auto|nullable|integer|min:1|max:500',
            'maxUses' => 'nullable|integer|min:1',
            'token' => 'nullable|integer|min:0',
            'claudeLimit' => 'nullable|integer|min:0',
        ]);
 
        DB::beginTransaction();
 
        try {
            if ($validated['codeMode'] === 'custom') {
                $code = strtoupper(trim($validated['customCode']));
 
                $existsInPool = Coupons::where('M_CouponsCode', $code)->exists();
                $existsActive = Coupon::where('M_CouponCode', $code)->exists();
 
                if ($existsInPool || $existsActive) {
                    return response()->json([
                        'message' => "Kode kupon \"{$code}\" sudah pernah digunakan sebelumnya. Gunakan kode yang berbeda agar tidak terjadi konflik.",
                    ], 422);
                }
 
                Coupon::create([
                    'M_CouponM_PlanID' => $validated['planId'],
                    'M_CouponDays' => $validated['days'],
                    'M_CouponCode' => $code,
                    'M_CouponExpired' => $validated['expired'],
                    'M_CouponMaxUses' => $validated['maxUses'] ?? null,
                    'M_CouponToken' => $validated['token'] ?? null,
                    'M_CouponClaudeLimit' => $validated['claudeLimit'] ?? null,
                    'M_CouponUsed' => 'N',
                    'M_CouponCreatedBy' => $user->M_UserID,
                    'M_CouponCreated' => now(),
                ]);
 
            } else {
                $count = $validated['count'] ?? 1;
 
                $codes = Coupons::where('M_CouponsUsed', 'N')
                    ->limit($count)
                    ->get();
 
                if ($codes->isEmpty()) {
                    return response()->json([
                        'message' => 'Stok kode kupon habis. Harap generate ulang pool kode terlebih dahulu.',
                    ], 400);
                }
 
                $insert    = [];
                $updateIds = [];
 
                foreach ($codes as $poolCode) {
                    $insert[] = [
                        'M_CouponM_PlanID' => $validated['planId'],
                        'M_CouponDays' => $validated['days'],
                        'M_CouponCode' => $poolCode->M_CouponsCode,
                        'M_CouponExpired' => $validated['expired'],
                        'M_CouponMaxUses' => $validated['maxUses'] ?? null,
                        'M_CouponToken' => $validated['token'] ?? null,
                        'M_CouponClaudeLimit' => $validated['claudeLimit'] ?? null,
                        'M_CouponUsed' => 'N',
                        'M_CouponCreatedBy' => $user->M_UserID,
                        'M_CouponCreated' => now(),
                    ];
                    $updateIds[] = $poolCode->M_CouponsID;
                }
 
                Coupon::insert($insert);
                Coupons::whereIn('M_CouponsID', $updateIds)->update(['M_CouponsUsed' => 'Y']);
            }
 
            DB::commit();
 
            return response()->json(['message' => 'Kupon berhasil dibuat.']);
 
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
 
    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
 
        $inPool = Coupons::where('M_CouponsCode', $coupon->M_CouponCode)->exists();
        if ($inPool) {
            Coupons::where('M_CouponsCode', $coupon->M_CouponCode)
                ->update([
                    'M_CouponsUsed'        => 'N',
                    'M_CouponsLastUpdated'  => now(),
                ]);
        }
 
        CouponRedemption::where('M_RedemptionCouponID', $coupon->M_CouponID)->delete();
 
        $coupon->delete();
 
        return response()->json(['message' => 'Kupon berhasil dihapus.']);
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
            $coupons[] = ['M_CouponsCode' => $code, 'M_CouponsUsed' => 'N'];
 
            if (count($coupons) >= $batchSize) {
                Coupons::query()->insert($coupons);
                $coupons = [];
            }
        }
 
        if (!empty($coupons)) {
            Coupons::query()->insert($coupons);
        }
 
        return response()->json([
            'message' => 'Successfully generated 10,000 coupon codes!',
            'duration_seconds' => round(microtime(true) - $startTime, 2),
        ]);
    }
}