<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
// use App\Mail\SendEmail;
use App\Models\User;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
// use Illuminate\Support\Str;

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
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // public function sendEmail(Request $request)
    // {
    //     $request->validate([
    //         'email' => 'required|email',
    //     ]);
    
    //     $user = DB::table('m_user')->where('M_UserEmail', $request->email)->first();
    
    //     if (!$user) {
    //         return response()->json([
    //             'error' => 'Email unregistered.'
    //         ], 404);
    //     }
    
    //     $token = Str::random(64);
    
    //     DB::table('m_user')->updateOrInsert(
    //         ['M_UserEmail' => $request->email],
    //         ['M_UserToken' => $token]
    //     );
    
    //     $resetLink = url("/new-password?email={$request->email}&token={$token}");
    
    //     Mail::to($request->email)->send(new SendEmail($resetLink, $user->M_UserFullName));
    
    //     return response()->json([
    //         'message' => 'A password reset link has been sent to your email.'
    //     ], 200);
    // }

    // public function newPassword(Request $request)
    // {
    //     $request->validate([
    //         'email' => 'required|email',
    //         'token' => 'required',
    //         'password' => 'required|min:6',
    //     ]);
    
    //     $user = User::where('M_UserEmail', $request->email)
    //         ->where('M_UserToken', $request->token)
    //         ->first();
    
    //     if (!$user) { 
    //         return response()->json(['message' => 'Token is invalid or has expired, please request a password reset again.'], 400);
    //     }
    
    //     $user->update([
    //         'M_UserPassword' => Hash::make($request->password),
    //         'M_UserToken' => null,
    //     ]);
    
    //     $sessionToken = Str::random(64);
        
    //     $userAbilityRules = json_encode([
    //         ['action' => 'manage', 'subject' => 'all']
    //     ]);
    
    //     $userData = [
    //         'username' => $user->M_UserFullName,
    //         'email' => $user->M_UserEmail,
    //         'avatar' => $user->M_UserImage ?? null,
    //     ];
    
    //     $user->update(['M_UserToken' => $sessionToken]);
    
    //     return response()->json([
    //         'accessToken' => $sessionToken,
    //         'userAbilityRules' => $userAbilityRules,
    //         'userData' => $userData,
    //         'token_type' => 'Bearer',
    //     ], 200);
    // }
}

