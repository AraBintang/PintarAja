<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP code</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Sora:wght@300;400;600;700&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background-color: #0d0f14;
            font-family: 'Sora', sans-serif;
            color: #e8eaf0;
            -webkit-font-smoothing: antialiased;
        }

        .wrapper {
            width: 100%;
            padding: 48px 16px;
            background-color: #0d0f14;
        }

        .container {
            max-width: 560px;
            margin: 0 auto;
            background: linear-gradient(145deg, #13161e, #1a1e2a);
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.07);
            overflow: hidden;
            box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03);
        }

        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #6c63ff, #a78bfa, #60a5fa, #34d399);
        }

        .header {
            padding: 40px 48px 32px;
            text-align: center;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .logo-mark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #6c63ff, #a78bfa);
            border-radius: 14px;
            margin-bottom: 20px;
            box-shadow: 0 8px 24px rgba(108, 99, 255, 0.35);
        }

        .logo-mark svg {
            width: 26px;
            height: 26px;
            fill: none;
            stroke: #fff;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #f0f2f8;
            letter-spacing: -0.4px;
            margin-bottom: 6px;
        }

        .header p {
            font-size: 14px;
            color: #6b7280;
            font-weight: 300;
        }

        .body {
            padding: 40px 48px;
            text-align: center;
        }

        .body-text {
            font-size: 15px;
            line-height: 1.7;
            color: #9ca3af;
            margin-bottom: 36px;
        }

        .otp-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #6c63ff;
            margin-bottom: 16px;
        }

        .otp-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 36px;
        }

        .otp-glow {
            position: absolute;
            inset: -20px;
            background: radial-gradient(ellipse at center, rgba(108, 99, 255, 0.15) 0%, transparent 70%);
            pointer-events: none;
        }

        .otp-code {
            font-family: 'Space Mono', monospace;
            font-size: 48px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #f0f2f8;
            padding: 24px 36px;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(108, 99, 255, 0.3);
            border-radius: 16px;
            position: relative;
            z-index: 1;
            text-shadow: 0 0 32px rgba(108, 99, 255, 0.5);
        }

        .expiry-notice {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(251, 191, 36, 0.08);
            border: 1px solid rgba(251, 191, 36, 0.2);
            border-radius: 100px;
            padding: 8px 18px;
            font-size: 13px;
            color: #fbbf24;
            margin-bottom: 36px;
        }

        .expiry-notice svg {
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        .divider {
            height: 1px;
            background: rgba(255,255,255,0.06);
            margin-bottom: 28px;
        }

        .warning-box {
            background: rgba(239, 68, 68, 0.07);
            border: 1px solid rgba(239, 68, 68, 0.15);
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 13px;
            color: #f87171;
            line-height: 1.6;
            text-align: left;
        }

        .warning-box strong {
            display: block;
            font-weight: 600;
            margin-bottom: 4px;
            color: #ef4444;
        }

        .footer {
            padding: 24px 48px 36px;
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.06);
        }

        .footer p {
            font-size: 12px;
            color: #4b5563;
            line-height: 1.8;
        }

        .footer a {
            color: #6c63ff;
            text-decoration: none;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .header, .body, .footer {
                padding-left: 28px;
                padding-right: 28px;
            }

            .otp-code {
                font-size: 36px;
                letter-spacing: 8px;
                padding: 20px 24px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="accent-bar"></div>

            <div class="header">
                <div class="logo-mark">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                </div>
                <h1>Verify Your Identity</h1>
                <p>One time code to continue</p>
            </div>

            <div class="body">
                <p class="body-text">
                    We received a verification request for your account.<br>
                    Use the code below to continue.
                </p>

                <p class="otp-label">OTP Code</p>

                <div class="otp-wrapper">
                    <div class="otp-glow"></div>
                    <div class="otp-code">{{ $otp }}</div>
                </div>

                <div>
                    <span class="expiry-notice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Code is valid for <strong>&nbsp;10 minute</strong>
                    </span>
                </div>

                <div class="divider"></div>

                <div class="warning-box">
                    <strong>⚠ Do not share this code</strong>
                    If you didn't request this code, please ignore this email or contact our support team immediately. We will never ask for your OTP.
                </div>
            </div>

            <div class="footer">
                <p>
                    This email was sent automatically, please do not reply.<br>
                   {{-- Need help? <a href="mailto:support@example.com">Contact Us</a><br><br> --}}
                    &copy; {{ date('Y') }} Pintaraja. Copyright protected.
                </p>
            </div>

        </div>
    </div>
</body>
</html>