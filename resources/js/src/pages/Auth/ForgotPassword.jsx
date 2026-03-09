import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Password reset requested for:', email);
        setIsSubmitted(true);
    };

    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f5] dark:bg-gray-900 p-6 font-sans transition-colors duration-300">
            {/* Dark mode toggle */}
            <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 z-50 p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all border border-gray-100 dark:border-gray-700"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {/* Logo/Brand */}
            <div className="mb-8 flex items-end gap-0 animate-in fade-in slide-in-from-top-4 duration-700">
                <img src="/p doank.png" alt="Pintaraja" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight pb-[2px] -ml-[3px]">intaraja</span>
            </div>

            <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
                    {!isSubmitted ? (
                        <>
                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Reset Password</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-[15px]">Masukkan email Kamu untuk menerima link reset password</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                                    <div className="relative group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nama@email.com"
                                            className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px]"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2 text-[16px]"
                                >
                                    Kirim Link Reset
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 rounded-full bg-teal-50 text-[#4A90D9] flex items-center justify-center mx-auto mb-6">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Cek Email Kamu</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-8">
                                Kami telah mengirimkan link reset password ke <span className="font-bold text-gray-900 dark:text-white">{email}</span>
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-[#4A90D9] font-bold hover:underline text-[15px]"
                            >
                                Tidak menerima email? Kirim ulang
                            </button>
                        </div>
                    )}

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-[14px]">
                            Ingat password Kamu?{' '}
                            <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                                Kembali ke Login
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-gray-400 dark:text-gray-500 text-xs tracking-wide">
                    &copy; {new Date().getFullYear()} PINTARAJA AI • SMART EDUCATION
                </p>
            </div>
        </div>
    );
}
