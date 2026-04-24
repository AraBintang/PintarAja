<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\PaperController;
use App\Http\Controllers\ParaphraseController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\ResetController;
use App\Http\Controllers\SettingAiController;
use App\Http\Controllers\TranscribeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WebSettingController;
use App\Http\Controllers\PlagiarismController;
use App\Http\Controllers\WorkbookController;
use App\Http\Controllers\WriterController;
use Illuminate\Support\Facades\Route;

Route::get('/plans', [PlanController::class, 'index']);

Route::get('/settings/public', [WebSettingController::class, 'public']);

Route::post('/payments/notify', [PaymentController::class, 'notify']);

Route::post('/bepro/callback', [PlagiarismController::class, 'callback']);

Route::middleware('guest:sanctum')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

    Route::post('/forgot-password', [ResetController::class, 'sendEmail']);
    Route::post('/new-password', [ResetController::class, 'newPassword']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('referrals')->group(function () {
        Route::get('/', [ReferralController::class, 'index']);
        Route::post('/activate', [ReferralController::class, 'activate']);
        Route::post('/claim-free-month', [ReferralController::class, 'claimFreeMonth']);
    });

    Route::prefix('profiles')->group(function () {
        Route::get('/', [ProfileController::class, 'me']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::put('/password', [ProfileController::class, 'changePassword']);
        Route::post('/redeem', [ProfileController::class, 'redeemCoupon']);
    });

    Route::prefix('convers')->group(function () {
        Route::get('/', [ConversationController::class, 'index']);
        Route::post('/', [ConversationController::class, 'store']);
        Route::put('/{id}', [ConversationController::class, 'update']);
        Route::delete('/{id}', [ConversationController::class, 'destroy']);
    });

    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::get('/{id}', [ChatController::class, 'index2']);
        Route::post('/', [ChatController::class, 'generate']);
        Route::post('/upload', [ChatController::class, 'uploadFile']);
        Route::post('/delete', [ChatController::class, 'deleteFile']);
        Route::post('/gff', [ChatController::class, 'generateFromFile']);
    });

    Route::prefix('writers')->group(function () {
        Route::get('/', [WriterController::class, 'index']);
        Route::get('/files', [WriterController::class, 'files']);
        Route::post('/', [WriterController::class, 'generate']);
        Route::post('/upload-file', [WriterController::class, 'uploadFile']);
        Route::delete('/delete-file', [WriterController::class, 'deleteFile']);
    });

    Route::prefix('workbooks')->group(function () {
        Route::get('/', [WorkbookController::class, 'index']);
        Route::post('/', [WorkbookController::class, 'store']);
        Route::delete('/{id}', [WorkbookController::class, 'destroy']);
    });

    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);
        Route::post('/', [DocumentController::class, 'store']);
        Route::post('/download', [DocumentController::class, 'download']);
        Route::put('/{id}', [DocumentController::class, 'update']);
        Route::delete('/{id}', [DocumentController::class, 'destroy']);
    });

    Route::prefix('paraps')->group(function () {
        Route::get('/', [ParaphraseController::class, 'index']);
        Route::post('/', [ParaphraseController::class, 'paraphrase']);
        Route::put('/{id}', [ParaphraseController::class, 'update']);
        Route::delete('/{id}', [ParaphraseController::class, 'destroy']);
    });

    // Route::prefix('humans')->group(function () {
    //     Route::get('/', [HumanizerController::class, 'index']);
    //     Route::post('/', [HumanizerController::class, 'humanize']);
    //     Route::put('/{id}', [HumanizerController::class, 'update']);
    //     Route::delete('/{id}', [HumanizerController::class, 'destroy']);  // Coming Soon
    // });

    Route::prefix('transcribes')->group(function () {
        Route::get('/', [TranscribeController::class, 'index']);
        Route::get('/active', [TranscribeController::class, 'getActive']);
        Route::get('/{id}/status', [TranscribeController::class, 'getStatus']);
        Route::post('/', [TranscribeController::class, 'transcribe']);
        Route::put('/{id}', [TranscribeController::class, 'update']);
        Route::delete('/{id}', [TranscribeController::class, 'destroy']);
    });

    Route::prefix('plagiarism')->group(function () {
        Route::get('/', [PlagiarismController::class, 'index']);
        Route::get('/{id}/download', [PlagiarismController::class, 'downloadResult']);
        Route::get('/pending-payment', [PlagiarismController::class, 'pendingPayment']);
        Route::post('/', [PlagiarismController::class, 'store']);
        Route::post('/cancel-payment', [PlagiarismController::class, 'cancelPayment']);

        // Route::get('/services', [PlagiarismController::class, 'services']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/referral-discount', [PaymentController::class, 'getReferralDiscount']);
        Route::get('/{referenceId}', [PaymentController::class, 'indexByReferenceId']);
        Route::post('/', [PaymentController::class, 'store']);
    });

    // Route Admin Only
    Route::middleware('role:A')->group(function () {
        Route::prefix('blogs')->group(function () {
            Route::get('/', [BlogController::class, 'index']);
            Route::post('/', [BlogController::class, 'store']);
            Route::put('/{id}', [BlogController::class, 'update']);
            Route::delete('/{id}', [BlogController::class, 'destroy']);
        });

        Route::prefix('papers')->group(function () {
            Route::get('/', [PaperController::class, 'index']);
            Route::post('/', [PaperController::class, 'store']);
            Route::put('/{id}', [PaperController::class, 'update']);
            Route::delete('/{id}', [PaperController::class, 'destroy']);
        });

        Route::prefix('prompts')->group(function () {
            Route::get('/', [PromptController::class, 'index']);
            Route::post('/', [PromptController::class, 'store']);
            Route::put('/{id}', [PromptController::class, 'update']);
            Route::delete('/{id}', [PromptController::class, 'destroy']);
        });

        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingAiController::class, 'index']);
            Route::post('/', [SettingAiController::class, 'store']);
            Route::put('/{id}', [SettingAiController::class, 'update']);
            Route::put('/activate/{id}', [SettingAiController::class, 'activate']);
            Route::put('/deactivate/{id}', [SettingAiController::class, 'deactivate']);
            Route::delete('/{id}', [SettingAiController::class, 'destroy']);
        });

        Route::prefix('plans')->group(function () {
            Route::post('/', [PlanController::class, 'store']);
            Route::put('/{id}', [PlanController::class, 'update']);
            Route::delete('/{id}', [PlanController::class, 'destroy']);
        });

        Route::prefix('coupons')->group(function () {
            Route::get('/', [CouponController::class, 'index']);
            Route::get('/generate', [CouponController::class, 'generateOneMillion']);
            Route::post('/', [CouponController::class, 'store']);
            Route::delete('/{id}', [CouponController::class, 'destroy']);
        });

        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store']);
            Route::put('/{id}', [UserController::class, 'update']);
            Route::delete('/{id}', [UserController::class, 'destroy']);
        });

        Route::prefix('web-settings')->group(function () {
            Route::get('/', [WebSettingController::class, 'index']);
            Route::post('/', [WebSettingController::class, 'store']);
            Route::put('/{id}', [WebSettingController::class, 'update']);
            Route::delete('/{id}', [WebSettingController::class, 'destroy']);
        });
    });
});