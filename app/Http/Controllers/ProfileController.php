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
        $user = $request->user()->load('plan');

        if ($user->M_UserPlan != 1 && $user->M_UserSubsExp !== null && now()->isAfter($user->M_UserSubsExp)) {
            $user->update([
                'M_UserPlan' => 1,
                'M_UserSubsExp' => null,
            ]);
            $user->load('plan');
        }

        return response()->json([
            'id' => $user->M_UserID,
            'email' => $user->M_UserEmail,
            'name' => $user->M_UserFullName,
            'image' => $user->M_UserImage,
            'phone' => $user->M_UserPhone,
            'role' => $user->M_UserRole,
            'quota' => $user->M_UserQuota ?? 0,

            'plan_id' => $user->M_UserPlan,
            'plan_name' => $user->plan?->M_PlanName,

            'subscription_expired_at' => $user->M_UserSubsExp,
        ]);
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
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'password_old' => 'nullable|string|min:8',
            'password' => 'required|string|min:8'
        ]);

        if (!empty($user->M_UserPassword)) {

            if (!$request->password_old) {
                return response()->json([
                    'message' => 'Password lama wajib diisi'
                ], 400);
            }

            if (!Hash::check($request->password_old, $user->M_UserPassword)) {
                return response()->json([
                    'message' => 'Password lama salah'
                ], 400);
            }
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