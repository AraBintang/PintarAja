<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Coupon;
use App\Models\Plan;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    public function generate(Request $request)
    {
        $secret = config('services.smtech.secret') ?? env('SMTECH_SECRET', 'SMTech_PintarAja_Api_2026');
        if ($request->header('X-SMTECH-SECRET') !== $secret) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $kodeUnik = 'PTR-' . strtoupper(Str::random(6));
        $plan = Plan::orderBy('M_PlanID', 'desc')->first();

        Coupon::create([
            'M_CouponCode' => $kodeUnik,
            'M_CouponM_PlanID' => $plan ? $plan->M_PlanID : 1,
            'M_CouponDays' => 30,
            'M_CouponMaxUses' => 1,
            'M_CouponUsed' => 0,
            'M_CouponCreated' => now()
        ]);

        return response()->json(['success' => true, 'voucher_code' => $kodeUnik]);
    }
}
