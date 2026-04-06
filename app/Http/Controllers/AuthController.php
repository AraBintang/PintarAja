<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\Otp;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use RyanChandler\LaravelCloudflareTurnstile\Rules\Turnstile;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:8',
            'remember' => 'nullable',
        ]);

        $user = User::where('M_UserEmail', $credentials['email'])->first();

        if (!$user) {
            return response()->json(['error' => 'User not found'], 400);
        }

        if (!$user->M_UserEmailVerifiedAt) {
            return response()->json(['error' => 'Email not yet verified, complete register first'], 400);
        }

        if ($user->M_UserIsActive !== 'Y') {
            return response()->json(['error' => 'User deactivated'], 400);
        }

        if (!Hash::check($credentials['password'], $user->M_UserPassword)) {
            return response()->json(['error' => 'Invalid password'], 400);
        }

        $expiry = $request->remember
            ? now()->addDays(30)
            : now()->addMinutes(30);

        $token = $user->createToken('auth', expiresAt: $expiry)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'email' => $user->M_UserEmail,
                'full_name' => $user->M_UserFullName,
                'image' => $user->M_UserImage,
                'phone' => $user->M_UserPhone,
            ],
        ]);
    }

    public function register(Request $request)
    {
        $credentials = $request->validate([
            'name'  => ['required', 'string'],
            'email' => ['required', 'email'],
            'password'  => ['required', 'min:8'],
            'cf-turnstile-response' => ['required', new Turnstile],
            'referral_code' => ['nullable', 'string', 'max:10'],
        ]);
    
        $user = User::where('M_UserEmail', $credentials['email'])->first();
    
        if ($user && $user->M_UserEmailVerifiedAt !== null) {
            return response()->json(['message' => 'Email already registered.'], 400);
        }
    
        $referredByUser = null;
        if (!empty($credentials['referral_code'])) {
            $referredByUser = User::where('M_UserReferralCode', $credentials['referral_code'])
                ->whereNotNull('M_UserEmailVerifiedAt')
                ->first();
    
            // Kode tidak valid, tapi tidak error fatal — hanya abaikan
            // Jika mau strict bisa uncomment baris di bawah:
            // if (!$referredByUser) {
            //     return response()->json(['message' => 'Kode referral tidak valid.'], 400);
            // }
        }
    
        if (empty($user)) {
            $user = User::create([
                'M_UserEmail'  => $credentials['email'],
                'M_UserPassword' => Hash::make($credentials['password']),
                'M_UserFullName' => $credentials['name'],
                'M_UserReferredBy' => $referredByUser?->M_UserID,
            ]);
        } else {
            if ($referredByUser && !$user->M_UserReferredBy) {
                $user->update(['M_UserReferredBy' => $referredByUser->M_UserID]);
            }
        }
    
        $otp = random_int(100000, 999999);
    
        Otp::updateOrCreate(
            ['T_OtpM_UserEmail' => $credentials['email']],
            [
                'T_OtpValue' => $otp,
                'T_OtpExpired' => Carbon::now()->addMinutes(5),
            ]
        );
    
        Mail::to($credentials['email'])->send(new OtpMail($otp));
    
        return response()->json(['status' => 'OTP Send to email']);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
        ]);
    
        $otpData = Otp::where('T_OtpM_UserEmail', $request->email)
            ->where('T_OtpValue', $request->otp)
            ->where('T_OtpExpired', '>', now())
            ->first();
    
        if (!$otpData) {
            return response()->json(['message' => 'OTP invalid or expired'], 400);
        }
    
        $otpData->delete();
    
        $user = User::where('M_UserEmail', $request->email)->first();
    
        $premiumPlan = Plan::where('M_PlanID', '>', 1)
            ->orderBy('M_PlanID', 'ASC')
            ->first();
    
        $referralCode = $this->generateUniqueReferralCode();
    
        $user->update([
            'M_UserEmailVerifiedAt' => now(),
            'M_UserPlan' => $premiumPlan?->M_PlanID,
            'M_UserSubsExp' => now()->addDays(7),
            'M_UserReferralCode' => $referralCode,
        ]);
    
        $token = $user->createToken('auth')->plainTextToken;
    
        return response()->json([
            'token' => $token,
            'user' => [
                'email' => $user->M_UserEmail,
                'full_name' => $user->M_UserFullName,
                'image' => $user->M_UserImage,
                'phone' => $user->M_UserPhone,
                'referral_code' => $user->M_UserReferralCode,
            ],
        ]);
    }

    public function resendOtp(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('M_UserEmail', $credentials['email'])->first();

        $otp = random_int(100000, 999999);

        Otp::updateOrCreate(
            ['T_OtpM_UserEmail' => $credentials['email']],
            [
                'T_OtpValue' => $otp,
                'T_OtpExpired' => Carbon::now()->addMinutes(5)
            ]
        );

        Mail::to($credentials['email'])->send(new OtpMail($otp));

        return response()->json([
            'status' => 'OTP Send to email',
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
 
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successfully'
        ]);
    }
}

