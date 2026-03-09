<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
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

        .greeting {
            font-size: 15px;
            color: #9ca3af;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #f0f2f8;
            font-weight: 600;
        }

        .body-text {
            font-size: 15px;
            line-height: 1.7;
            color: #9ca3af;
            margin-bottom: 36px;
            margin-top: 12px;
        }

        .button-wrapper {
            position: relative;
            display: inline-block;
            margin-bottom: 36px;
        }

        .button-glow {
            position: absolute;
            inset: -20px;
            background: radial-gradient(ellipse at center, rgba(108, 99, 255, 0.18) 0%, transparent 70%);
            pointer-events: none;
        }

        .reset-button {
            position: relative;
            z-index: 1;
            display: inline-block;
            background: linear-gradient(135deg, #6c63ff, #a78bfa);
            color: #ffffff;
            font-family: 'Sora', sans-serif;
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 12px;
            box-shadow: 0 8px 28px rgba(108, 99, 255, 0.4);
            transition: opacity 0.2s;
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

        .link-fallback {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 12px;
            padding: 16px 20px;
            font-size: 12px;
            color: #6b7280;
            line-height: 1.8;
            text-align: left;
            margin-bottom: 24px;
            word-break: break-all;
        }

        .link-fallback strong {
            display: block;
            font-weight: 600;
            margin-bottom: 6px;
            color: #9ca3af;
            font-size: 11px;
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .link-fallback a {
            color: #6c63ff;
            text-decoration: none;
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

        @media (max-width: 600px) {
            .header, .body, .footer {
                padding-left: 28px;
                padding-right: 28px;
            }

            .reset-button {
                padding: 14px 28px;
                font-size: 14px;
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
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h1>Reset Your Password</h1>
                <p>A request was made to change your account password</p>
            </div>

            <div class="body">
                <p class="greeting">Hello, <strong>{{ $userName }}</strong></p>
                <p class="body-text">
                    We received a request to reset the password for your account.<br>
                    Click the button below to create a new password.
                </p>

                <div class="button-wrapper">
                    <div class="button-glow"></div>
                    <a href="{{ $resetLink }}" class="reset-button">Reset Password</a>
                </div>

                <div>
                    <span class="expiry-notice">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        This link expires in <strong>&nbsp;60 minutes</strong>
                    </span>
                </div>

                <div class="divider"></div>

                <div class="link-fallback">
                    <strong>Button not working?</strong>
                    Copy and paste the link below into your browser:<br>
                    <a href="{{ $resetLink }}">{{ $resetLink }}</a>
                </div>

                <div class="warning-box">
                    <strong>⚠ Didn't request this?</strong>
                    If you did not request a password reset, please ignore this email. Your password will remain unchanged. If you believe someone is trying to access your account, contact our support team immediately.
                </div>
            </div>

            <div class="footer">
                <p>
                    This email was sent automatically, please do not reply.<br>
                    Need help? <a href="mailto:support@example.com">Contact our support team</a><br><br>
                    &copy; {{ date('Y') }} Your Application Name. All rights reserved.
                </p>
            </div>

        </div>
    </div>
</body>
</html>