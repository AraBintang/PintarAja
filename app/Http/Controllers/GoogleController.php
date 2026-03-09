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
        $clientId = config('services.google.client_id');
        $redirectUri = config('services.google.redirect');

        $url = "https://accounts.google.com/o/oauth2/v2/auth?client_id={$clientId}&redirect_uri={$redirectUri}&response_type=code&scope=email%20profile";

        return redirect($url);
    }

    protected function gaClientIdFromCookie(Request $req): string
    {
        $ga = $req->cookie('_ga');
        if ($ga && preg_match('/GA\d+\.\d+\.(\d+\.\d+)/', $ga, $m)) {
            return $m[1];
        }
        if (!$req->session()->has('ga_client_id')) {
            $req->session()->put('ga_client_id', (string) Str::uuid());
        }
        return $req->session()->get('ga_client_id');
    }

    public function handleGoogleCallback(Request $request)
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');
        $code = $request->input('code');

        $response = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        $accessToken = $response->json(['access_token']);

        $userResponse = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v2/userinfo');
        $userDataGoogle = $userResponse->json();

        $user = User::where('M_UserEmail', $userDataGoogle['email'])->first();

        if ($user) {
            $user->update([
                'M_UserImage' => $userDataGoogle['picture'],
                'M_UserToken' => Str::random(64),
            ]);
        } else {
            $user = User::create([
                'M_UserEmail' => $userDataGoogle['email'],
                'M_UserFullName' => $userDataGoogle['name'],
                'M_UserImage' => $userDataGoogle['picture'],
                'M_UserToken' => Str::random(64),
                'M_UserEmailVerifiedAt' => now(),
            ]);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ]);
    }
}
