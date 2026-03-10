import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

export default function NotFoundPage() {
    const { theme } = useTheme?.() || { theme: 'light' };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center px-6 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            {/* 404 Illustration */}
            <div className="relative w-[340px] h-[260px] md:w-[440px] md:h-[320px] flex items-center justify-center select-none mb-6">

                {/* Cyan blob background */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 320" fill="none">
                    <path
                        d="M120 60 C60 40, 30 100, 50 160 C20 200, 60 270, 140 260 C180 280, 260 290, 320 260 C380 240, 420 200, 400 150 C420 100, 380 50, 320 60 C280 30, 180 20, 120 60Z"
                        fill={theme === 'dark' ? 'rgba(56, 189, 186, 0.15)' : '#d5f5f5'}
                    />
                    <path
                        d="M80 120 C50 90, 70 60, 110 80 C90 50, 140 30, 150 70 C160 40, 200 50, 190 80"
                        fill={theme === 'dark' ? 'rgba(56, 189, 186, 0.1)' : '#e0f7f7'}
                    />
                    <path
                        d="M300 80 C340 50, 390 80, 370 120 C400 100, 410 150, 380 160"
                        fill={theme === 'dark' ? 'rgba(56, 189, 186, 0.1)' : '#e0f7f7'}
                    />
                    <path
                        d="M100 200 C60 220, 50 250, 100 260 C80 270, 120 290, 160 270"
                        fill={theme === 'dark' ? 'rgba(56, 189, 186, 0.1)' : '#e0f7f7'}
                    />
                </svg>

                {/* Decorative sparkles & elements */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 320" fill="none" stroke={theme === 'dark' ? '#e5e7eb' : '#1a202c'} strokeWidth="1.5">
                    {/* Top-left sparkle cross */}
                    <line x1="95" y1="55" x2="95" y2="45" strokeLinecap="round" />
                    <line x1="90" y1="50" x2="100" y2="50" strokeLinecap="round" />

                    {/* Top-left dot */}
                    <circle cx="110" cy="70" r="1.5" fill={theme === 'dark' ? '#e5e7eb' : '#1a202c'} stroke="none" />

                    {/* Mid-left small circles */}
                    <circle cx="80" cy="210" r="3" strokeWidth="1" />
                    <circle cx="95" cy="225" r="2" strokeWidth="1" />

                    {/* Top squiggle lines */}
                    <path d="M135 50 C137 42, 140 42, 138 36" strokeLinecap="round" fill="none" />
                    <path d="M148 45 C150 37, 153 37, 151 31" strokeLinecap="round" fill="none" />

                    {/* Right-side sparkle */}
                    <line x1="355" y1="78" x2="355" y2="68" strokeLinecap="round" />
                    <line x1="350" y1="73" x2="360" y2="73" strokeLinecap="round" />

                    {/* Right dots cluster */}
                    <circle cx="340" cy="105" r="1.5" fill={theme === 'dark' ? '#e5e7eb' : '#1a202c'} stroke="none" />
                    <circle cx="350" cy="115" r="1" fill={theme === 'dark' ? '#e5e7eb' : '#1a202c'} stroke="none" />
                    <circle cx="362" cy="108" r="1.5" fill={theme === 'dark' ? '#e5e7eb' : '#1a202c'} stroke="none" />

                    {/* Top-right sparkle small */}
                    <line x1="370" y1="60" x2="370" y2="54" strokeLinecap="round" strokeWidth="1" />
                    <line x1="367" y1="57" x2="373" y2="57" strokeLinecap="round" strokeWidth="1" />

                    {/* Right swirl */}
                    <path d="M375 140 C380 135, 385 140, 380 145 C375 150, 370 145, 375 140" strokeLinecap="round" fill="none" strokeWidth="1" />

                    {/* Bottom-left small circle */}
                    <circle cx="115" cy="245" r="2.5" strokeWidth="1" />
                </svg>

                {/* Main 404 Text - brush style */}
                <h1
                    className="relative z-10 font-extrabold tracking-tight select-none"
                    style={{
                        fontSize: 'clamp(100px, 18vw, 160px)',
                        fontFamily: "'Permanent Marker', 'Caveat', 'Segoe Script', 'Brush Script MT', cursive",
                        color: theme === 'dark' ? '#f3f4f6' : '#1a202c',
                        lineHeight: 1,
                        textShadow: theme === 'dark'
                            ? '2px 2px 0 rgba(0,0,0,0.3)'
                            : '2px 2px 0 rgba(0,0,0,0.05)',
                        transform: 'rotate(-3deg)',
                        letterSpacing: '-0.02em',
                    }}
                >
                    404
                </h1>
            </div>

            {/* Text content */}
            <h2 className={`text-2xl md:text-3xl font-bold mb-4 text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
                style={{ fontFamily: "'Inter', 'Instrument Sans', sans-serif" }}
            >
                Uh oh. Halaman tidak ditemukan.
            </h2>
            <p className={`text-center max-w-md text-[15px] leading-relaxed mb-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Kunjungi halaman utama kami yang memang ada {''}
                <Link
                    to="/app/chat"
                    className={`underline underline-offset-2 font-medium transition-colors ${theme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                >
                    Halaman Chat
                </Link>{' '}
            </p>

            {/* CTA Button */}
            <Link
                to="/app/chat"
                className="px-8 py-3 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-[15px] font-bold rounded-2xl shadow-[0_4px_20px_rgba(74,144,217,0.25)] hover:shadow-[0_4px_28px_rgba(74,144,217,0.4)] transition-all hover:scale-[1.02]"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
}
