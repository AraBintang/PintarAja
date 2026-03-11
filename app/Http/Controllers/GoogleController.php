<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function redirectToGoogle()
    {
        $query = http_build_query([
            'client_id' => config('services.google.client_id'),
            'redirect_uri' => config('services.google.redirect'),
            'response_type' => 'code',
            'scope' => 'email profile',
            'access_type' => 'offline',
            'prompt' => 'select_account',
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

        $user = User::updateOrCreate(
            ['M_UserEmail' => $googleUser['email']],
            [
                'M_UserFullName' => $googleUser['name'] ?? '',
                'M_UserImage' => $googleUser['picture'] ?? null,
                'M_UserEmailVerifiedAt' => now(),
                'M_UserToken' => Str::random(64),
            ]
        );

        $token = $user->createToken('auth')->plainTextToken;

        return redirect("/google-auth?token={$token}");
    }
}