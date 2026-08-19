<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
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
        $user->recordLoginFromRequest($request);
 
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
            'M_UserSubsExp' => now()->addDays(1),
            'M_UserReferralCode' => $newReferralCode,
            'M_UserReferredBy' => $referredByUser?->M_UserID,
        ]);
    }
 
    private function generateUniqueReferralCode(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (User::where('M_UserReferralCode', $code)->exists());

        return $code;
    }
        public function loginMobile(Request $request)
    {
        // 1. Terima token dari aplikasi Flutter
        $accessToken = $request->input('access_token');
        
        if (!$accessToken) {
            return response()->json(['error' => 'Akses token tidak ditemukan.'], 400);
        }

        // 2. Minta data user ke Google API
        $googleUser = Http::withToken($accessToken)
            ->get('https://www.googleapis.com/oauth2/v2/userinfo')
            ->json();

        if (!isset($googleUser['email'])) {
            return response()->json(['error' => 'Token Google tidak valid.'], 401);
        }

        // 3. Cek apakah user baru
        $isNewUser = !User::where('M_UserEmail', $googleUser['email'])->exists();

        // 4. Update atau Buat User
        $user = User::updateOrCreate(
            ['M_UserEmail' => $googleUser['email']],
            [
                'M_UserFullName' => $googleUser['name'] ?? '',
                'M_UserImage' => $googleUser['picture'] ?? null,
                'M_UserEmailVerifiedAt' => now(),
                'M_UserToken' => Str::random(64),
            ]
        );

        // 5. Setup Plan Trial & Referral untuk user baru
        if ($isNewUser) {
            // Memanggil fungsi private handleNewUserSetup yang sudah ada
            $this->handleNewUserSetup($user, '');
        } elseif (!$user->M_UserReferralCode) {
            $user->generateReferralCode();
        }

        // 6. Buat Token Sanctum untuk session aplikasi
        $token = $user->createToken('auth')->plainTextToken;
        $user->recordLoginFromRequest($request);

        // 7. Kembalikan Response JSON (Sesuai kebutuhan Mobile App)
        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }
}
