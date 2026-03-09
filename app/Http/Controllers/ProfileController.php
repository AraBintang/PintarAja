<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:20',
            'phone' => 'nullable|string|max:45'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'M_UserFullName' => $request->name,
            'M_UserPhone' => $request->phone,
            'M_UserLastUpdated' => now()
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'password' => 'required|min:8'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'M_UserPassword' => Hash::make($request->password),
            'M_UserLastUpdated' => now()
        ]);

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    public function redeemCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $coupon = Coupon::where('M_CouponCode', $request->code)
            ->where('M_CouponUsed', 'N')
            ->whereDate('M_CouponExpired', '>=', now())
            ->first();

        if (!$coupon) {
            return response()->json([
                'message' => 'Coupon invalid or already used'
            ], 400);
        }

        $days = $coupon->M_CouponDays;

        $currentExpiry = $user->M_UserSubsExp
            ? Carbon::parse($user->M_UserSubsExp)
            : now();

        $newExpiry = $currentExpiry->isPast()
            ? now()->addDays($days)
            : $currentExpiry->addDays($days);

        DB::transaction(function () use ($user, $coupon, $newExpiry) {

            $user->update([
                'M_UserPlan' => $coupon->M_CouponM_PlanID,
                'M_UserSubsExp' => $newExpiry,
                'M_UserLastUpdated' => now()
            ]);

            $coupon->update([
                'M_CouponUsed' => 'Y',
                'M_CouponUsedDate' => now(),
                'M_CouponM_UserID' => $user->M_UserID,
                'M_CouponLastUpdated' => now()
            ]);
        });

        return response()->json([
            'message' => 'Coupon redeemed successfully',
            'expired_at' => $newExpiry
        ]);
    }
}