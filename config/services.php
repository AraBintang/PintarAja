<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'tripay' => [
       'api_key' => env('TRIPAY_API_KEY'),
        'private_key' => env('TRIPAY_PRIVATE_KEY'),
        'merchant_code' => env('TRIPAY_MERCHANT_CODE'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'xendit' => [
        'secret_key' => env('XENDIT_SECRET_KEY'),
    ],

    'turnstile' => [
        'key' => env('TURNSTILE_SITE_KEY'),
        'secret' => env('TURNSTILE_SECRET_KEY'),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
        'paraphrase_model' => env('OPENAI_PARAPHRASE_MODEL', 'gpt-4o-mini'),
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
    ],

    'bepro' => [
        'api_key' => env('BEPRO_API_KEY'),
        'secret' => env('BEPRO_SECRET'),
        'webhook_secret' => env('BEPRO_WEBHOOK_SECRET'),
    ],

    'smtech' => [
        'secret' => env('SMTECH_SECRET'),
    ],
];
