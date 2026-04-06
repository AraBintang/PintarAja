<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\ReferralUsage;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
class ReferralController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $usages = ReferralUsage::where('T_ReferralUsageOwnerID', $user->M_UserID)
            ->with('referredUser:M_UserID,M_UserFullName,M_UserEmail,M_UserCreated')
            ->orderBy('T_ReferralUsageSequence', 'asc')
            ->get();

        $totalCount = $usages->count();
        $pendingDiscount = $usages->where('T_ReferralUsageIsFreeMonth', false)->where('T_ReferralUsageIsUsed', false)->sum('T_ReferralUsageDiscountPercent');
        $hasFreeMonth = $usages->where('T_ReferralUsageIsFreeMonth', true)->where('T_ReferralUsageIsUsed', false)->count() > 0;

        $posInCycle = ($totalCount % 7);
        $toNextFree = $posInCycle === 0 ? 7 : (7 - $posInCycle);

        return response()->json([
            'referral_code' => $user->M_UserReferralCode,
            'referral_link' => config('app.url') . '/register?ref=' . $user->M_UserReferralCode,
            'total_referrals'  => $totalCount,
            'pending_discount' => (int) $pendingDiscount,
            'has_free_month' => $hasFreeMonth,
            'progress' => [
                'current_in_cycle' => $posInCycle,
                'to_next_free' => $toNextFree,
            ],
            'usages' => $usages->map(fn($u) => [
                'sequence' => $u->T_ReferralUsageSequence,
                'user_name' => $u->referredUser?->M_UserFullName ?? 'Unknown',
                'joined_at' => $u->T_ReferralUsageCreated?->toDateString(),
                'reward_type' => $u->T_ReferralUsageIsFreeMonth ? 'free_month' : 'discount_10',
                'reward_label' => $u->T_ReferralUsageIsFreeMonth ? 'Free 1 Bulan' : '+10% Diskon',
                'is_used' => $u->T_ReferralUsageIsUsed,
            ]),
        ]);
    }

    public function activate()
    {
        $user = Auth::user();

        if ($user->M_UserReferralCode) {
            return response()->json([
                'message' => 'Kode referral sudah aktif',
                'referral_code' => $user->M_UserReferralCode,
                'referral_link' => config('app.url') . '/register?ref=' . $user->M_UserReferralCode,
            ]);
        }

        $code = $user->generateReferralCode();

        return response()->json([
            'message' => 'Kode referral berhasil diaktifkan',
            'referral_code' => $code,
            'referral_link' => config('app.url') . '/register?ref=' . $code,
        ], 201);
    }

    public function claimFreeMonth()
    {
        $user = Auth::user();
    
        $reward = ReferralUsage::where('T_ReferralUsageOwnerID', $user->M_UserID)
            ->where('T_ReferralUsageIsFreeMonth', true)
            ->where('T_ReferralUsageIsUsed', false)
            ->first();
    
        if (!$reward) {
            return response()->json([
                'message' => 'Tidak ada reward free bulan yang tersedia.'
            ], 404);
        }
    
        $freePlan = Plan::where('M_PlanID', '>', 1)
            ->orderBy('M_PlanID', 'ASC')
            ->first();
    
        if (!$freePlan) {
            return response()->json([
                'message' => 'Plan tidak ditemukan.'
            ], 500);
        }
    
        $base = ($user->M_UserSubsExp && !Carbon::parse($user->M_UserSubsExp)->isPast())
            ? Carbon::parse($user->M_UserSubsExp)
            : now();
    
        $user->update([
            'M_UserPlan' => $freePlan->M_PlanID,
            'M_UserSubsExp' => $base->addDays(30),
        ]);
    
        ReferralUsage::where('T_ReferralUsageOwnerID', $user->M_UserID)
            ->where('T_ReferralUsageIsUsed', false)
            ->update(['T_ReferralUsageIsUsed' => true]);
    
        return response()->json([
            'message' => 'Free 1 bulan berhasil diklaim!',
            'expires_at' => $user->fresh()->M_UserSubsExp,
        ]);
    }
}