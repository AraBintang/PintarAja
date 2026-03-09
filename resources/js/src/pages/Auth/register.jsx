import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration attempt:', formData);
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

            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="bg-white dark:bg-gray-800 rounded-[32px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Daftar Akun</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-[15px]">Mulai perjalanan belajarmu dengan Pintaraja AI</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Nama Lengkap</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Masukkan nama lengkap"
                                    className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="nama@email.com"
                                    className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px]"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    </span>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">Konfirmasi</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    </span>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-4 text-[16px]"
                        >
                            Buat Akun Sekarang
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-[14px]">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                                Masuk di Sini
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-10 text-center text-gray-400 dark:text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
                    Dengan mendaftar, Anda menyetujui <a href="#" className="underline hover:text-[#4A90D9]">Ketentuan Layanan</a> dan <a href="#" className="underline hover:text-[#4A90D9]">Kebijakan Privasi</a> kami.
                </p>
            </div>
        </div>
    );
}
