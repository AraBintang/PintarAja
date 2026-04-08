<?php

use App\Http\Controllers\GoogleController;
use App\Http\Controllers\BlogController;
use Illuminate\Support\Facades\Route;

Route::get('auth/google', [GoogleController::class, 'redirectToGoogle']);
Route::get('auth/google/callback', [GoogleController::class, 'handleGoogleCallback']);

Route::get('/blog', [BlogController::class, 'userIndex']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);
Route::get('/blog/category/{category}', [BlogController::class, 'category']);

Route::get('{any?}', function() {
    return view('app');
})->where('any', '.*');
