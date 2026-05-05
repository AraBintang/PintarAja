<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    private const UPDATE_INTERVAL_MINUTES = 5;

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $user = $request->user();

        if ($user) {
            if (! $user->M_UserLastActive || $user->M_UserLastActive->lte(now()->subMinutes(self::UPDATE_INTERVAL_MINUTES))) {
                $user->recordActivityFromRequest($request);
            }
        }

        return $response;
    }
}
