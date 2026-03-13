<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Mail\OtpReset;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ResetController extends Controller
{
    public function sendEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('M_UserEmail', $request->email)->first();

        if (!$user || $user->M_UserEmailVerifiedAt == null) {
            return response()->json([
                'message' => 'Email unregistered or email not yet verified.'
            ], 400);
        }
        
    
        $token = Str::random(64);
    
        DB::table('m_user')->updateOrInsert(
            ['M_UserEmail' => $request->email],
            ['M_UserToken' => $token]
        );
    
        $resetLink = url("/new-password?email={$request->email}&token={$token}");
    
        Mail::to($request->email)->send(new OtpReset($resetLink, $user->M_UserFullName));
    
        return response()->json([
            'message' => 'A password reset link has been sent to your email.'
        ], 200);
    }

    public function newPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:8',
        ]);
    
        $user = User::where('M_UserEmail', $request->email)
            ->where('M_UserToken', $request->token)
            ->first();
    
        if (!$user) { 
            return response()->json(['message' => 'Token is invalid or has expired, please request a password reset again.'], 400);
        }
    
        $user->update([
            'M_UserPassword' => Hash::make($request->password),
            'M_UserToken' => null,
        ]);
    
        $sessionToken = Str::random(64);
    
        $user->update(['M_UserToken' => $sessionToken]);
    
        return response()->json([
            'message' => 'New Password created successfully'
        ], 200);
    }
}
