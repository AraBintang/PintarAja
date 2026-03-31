<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\ReferralUsage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirectToGoogle(Request $request)
    {
        $state = $request->query('ref', '');
 
        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
            'state' => $state,
        ]);
 
        return redirect("https://accounts.google.com/o/oauth2/v2/auth?$query");
    }
 
    public function handleGoogleCallback(Request $request)
    {
        if (!$request->has('code')) {
            return redirect('/login');
        }
 
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $request->code,
            'client_id' => config('services.google.client_id'),
            'client_secret' => config('services.google.client_secret'),
            'redirect_uri' => config('services.google.redirect'),
            'grant_type' => 'authorization_code',
        ]);
 
        if (!$tokenResponse->successful()) {
            return redirect('/login');
        }
 
        $accessToken = $tokenResponse->json('access_token');
 
        $googleUser = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v2/userinfo')
            ->json();
 
        if (!isset($googleUser['email'])) {
            return redirect('/login');
        }
 
        $referralCode = $request->query('state', '');
 
        $isNewUser = !User::where('M_UserEmail', $googleUser['email'])->exists();
 
        $user = User::updateOrCreate(
            ['M_UserEmail' => $googleUser['email']],
            [
                'M_UserFullName' => $googleUser['name'] ?? '',
                'M_UserImage' => $googleUser['picture'] ?? null,
                'M_UserEmailVerifiedAt' => now(),
                'M_UserToken' => Str::random(64),
            ]
        );
 
        if ($isNewUser) {
            $this->handleNewUserSetup($user, $referralCode);
        } elseif (!$user->M_UserReferralCode) {
            $user->generateReferralCode();
        }
 
        $token = $user->createToken('auth')->plainTextToken;
 
        return redirect("/google-auth?token={$token}");
    }
 
    private function handleNewUserSetup(User $user, string $referralCode): void
    {
        $trialPlan = Plan::where('M_PlanID', '>', 1)
            ->orderBy('M_PlanID', 'ASC')
            ->first();
 
        $newReferralCode = $this->generateUniqueReferralCode();
 
        $referredByUser = null;
        if (!empty($referralCode)) {
            $referredByUser = User::where('M_UserReferralCode', $referralCode)
                ->whereNotNull('M_UserEmailVerifiedAt')
                ->first();
        }
 
        $user->update([
            'M_UserPlan' => $trialPlan?->M_PlanID,
            'M_UserSubsExp' => now()->addDays(7),
            'M_UserReferralCode' => $newReferralCode,
            'M_UserReferredBy' => $referredByUser?->M_UserID,
        ]);
 
        if ($referredByUser) {
            $this->processReferralReward($user);
        }
    }
 
    private function processReferralReward(User $newUser): void
    {
        $ownerID = $newUser->M_UserReferredBy;
 
        $totalReferrals = ReferralUsage::where('T_ReferralUsageOwnerID', $ownerID)->count();
        $sequence = $totalReferrals + 1;
        $positionInCycle = (($sequence - 1) % 7) + 1;
 
        $isFreeMonth = ($positionInCycle === 7);
        $discountPercent = $isFreeMonth ? 0 : 10;
 
        ReferralUsage::create([
            'T_ReferralUsageOwnerID' => $ownerID,
            'T_ReferralUsageUserID' => $newUser->M_UserID,
            'T_ReferralUsageSequence' => $sequence,
            'T_ReferralUsageDiscountPercent' => $discountPercent,
            'T_ReferralUsageIsFreeMonth' => $isFreeMonth,
            'T_ReferralUsageIsUsed' => false,
            'T_ReferralUsageCreated' => now(),
        ]);
    }
 
    private function generateUniqueReferralCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        } while (User::where('M_UserReferralCode', $code)->exists());
 
        return $code;
    }
}