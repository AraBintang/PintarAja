import React, { useState } from 'react';
import { User, Gift, LogOut, X, Package, CreditCard, ChevronRight, Sparkles, Zap, Eye, EyeOff, Check, Lock } from 'lucide-react';

export default function UserSettingsModal({ isOpen, onClose, initialTab = 'Profil' }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [userName, setUserName] = useState('Adi Kurniawan');
    const [editedName, setEditedName] = useState('Adi Kurniawan');
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

    const passwordRequirements = [
        { id: 'length', text: 'Minimal 8 karakter', check: (pwd) => pwd.length >= 8 },
        { id: 'uppercase', text: 'Mengandung huruf besar', check: (pwd) => /[A-Z]/.test(pwd) },
        { id: 'lowercase', text: 'Mengandung huruf kecil', check: (pwd) => /[a-z]/.test(pwd) },
        { id: 'number', text: 'Mengandung angka', check: (pwd) => /[0-9]/.test(pwd) },
    ];

    // Update active tab when modal opens with a new initial tab
    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const userEmail = 'sekolahonline55@gmail.com';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans p-0 md:p-4">
            {/* Modal Container */}
            <div className="w-full md:max-w-[850px] h-[90dvh] md:h-[600px] flex flex-col md:flex-row bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300">

                {/* Left Sidebar - Hidden on mobile, or shown as horizontal scroll? Let's hide text on mobile or stack */}
                <div className="w-full md:w-[260px] flex md:flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto md:overflow-y-auto">
                    <div className="hidden md:block p-6 pb-4 text-left">
                        <h2 className="text-[20px] font-semibold tracking-tight">Settings</h2>
                    </div>

                    <div className="flex md:flex-col flex-1 px-4 py-2 space-x-2 md:space-x-0 md:space-y-1 whitespace-nowrap overflow-x-auto md:overflow-x-hidden no-scrollbar">
                        <button
                            onClick={() => setActiveTab('Profil')}
                            className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${activeTab === 'Profil' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <User className="w-[18px] h-[18px]" />
                            Profil
                        </button>
                        <button
                            onClick={() => setActiveTab('Subscription')}
                            className={`flex-shrink-0 md:w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all ${activeTab === 'Subscription' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <CreditCard className="w-[18px] h-[18px]" />
                            Subscription
                        </button>

                        <div className="hidden md:block my-4 border-t border-gray-200 dark:border-gray-700"></div>

                        <button
                            onClick={() => {
                                // Simulate logout
                                window.location.href = '/login';
                            }}
                            className="flex-shrink-0 md:w-full flex items-center justify-start px-3 py-2.5 rounded-lg text-[14px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <LogOut className="w-[18px] h-[18px]" />
                                <span className="hidden md:inline">Log out</span>
                                <span className="md:hidden">Keluar</span>
                            </div>
                        </button>
                    </div>

                    {/* Bottom User Area - Desktop Only */}
                    <div className="hidden md:block p-5 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-3 font-medium tracking-wide">Switch account</p>
                        <div className="flex items-center gap-3">
                            <div className="w-[34px] h-[34px] rounded-full bg-[#5c40e6] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[14px] font-semibold">{userInitial}</span>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-[14px] font-semibold text-gray-900 dark:text-white truncate">{userName}</p>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 md:px-8 py-4 md:py-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-[16px] md:text-[18px] font-semibold flex items-center gap-3 text-gray-900 dark:text-white capitalize">
                            {activeTab === 'Profil' && <User className="w-5 h-5 text-gray-400" />}
                            {activeTab === 'Subscription' && <CreditCard className="w-5 h-5 text-gray-400" />}
                            {activeTab === 'Subscription' ? 'Berlangganan' : activeTab}
                        </h3>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gray-50/30 dark:bg-gray-800/30">
                        {activeTab === 'Profil' && (
                            <div className="max-w-md mx-auto md:mx-0 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Name Input */}
                                <div className="space-y-2 text-left">
                                    <h4 className="text-[13px] md:text-[14px] font-medium text-gray-500 dark:text-gray-400">Account Name</h4>
                                    {isEditingProfile ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="w-full text-[15px] md:text-[16px] text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-blue-400 dark:border-blue-500 rounded-xl px-4 py-2.5 md:py-3 outline-none ring-2 ring-blue-100 dark:ring-blue-900/30 transition-all font-medium"
                                            autoFocus
                                        />
                                    ) : (
                                        <p className="text-[15px] md:text-[16px] text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 md:py-3 font-medium">{userName}</p>
                                    )}
                                </div>
                                {/* ... existing profile code ... */}
                                <div className="space-y-2 text-left">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[13px] md:text-[14px] font-medium text-gray-500 dark:text-gray-400">Email Address</h4>
                                    </div>
                                    <div className="relative group">
                                        <p className="text-[15px] md:text-[16px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 md:py-3 cursor-not-allowed">
                                            {userEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-left space-y-4">
                                    <h4 className="text-[14px] font-medium text-gray-900 dark:text-white">Keamanan</h4>

                                    {!isChangingPassword ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl gap-3">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[14px] font-semibold text-gray-900 dark:text-white">Password</p>
                                                <p className="text-[12px] md:text-[13px] text-gray-500 dark:text-gray-400">Jaga keamanan akun Anda</p>
                                            </div>
                                            <button
                                                onClick={() => setIsChangingPassword(true)}
                                                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-[13px] font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm whitespace-nowrap"
                                            >
                                                Ganti Password
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="p-4 md:p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl space-y-4 md:space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <h5 className="text-[14px] font-semibold text-gray-900 dark:text-white">Ubah Password</h5>

                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] md:text-[13px] font-medium text-gray-700 dark:text-gray-300">Password Lama</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword.current ? 'text' : 'password'}
                                                            value={passwords.current}
                                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                            placeholder="Password saat ini"
                                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[12px] md:text-[13px] font-medium text-gray-700 dark:text-gray-300">Password Baru</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword.new ? 'text' : 'password'}
                                                            value={passwords.new}
                                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                            placeholder="Minimal 8 karakter"
                                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                                                        />
                                                        <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 mt-2">
                                                    {passwordRequirements.map(req => {
                                                        const isValid = req.check(passwords.new);
                                                        return (
                                                            <div key={req.id} className={`flex items-center gap-2 text-[11px] md:text-[12px] font-medium transition-colors ${isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                                                {isValid ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-1 flex-shrink-0" />}
                                                                <span>{req.text}</span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>

                                                <div className="space-y-1.5 pt-2">
                                                    <label className="text-[12px] md:text-[13px] font-medium text-gray-700 dark:text-gray-300">Konfirmasi Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword.confirm ? 'text' : 'password'}
                                                            value={passwords.confirm}
                                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                            placeholder="Ketik ulang password"
                                                            className={`w-full bg-gray-50 dark:bg-gray-900 border ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-300' : 'border-gray-200'} rounded-xl px-4 py-2.5 text-[14px] font-mono`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
                                                <button onClick={() => setIsChangingPassword(false)} className="px-4 py-2 text-[13px] font-medium text-gray-500">Batal</button>
                                                <button
                                                    disabled={!passwords.current || !passwordRequirements.every(r => r.check(passwords.new)) || passwords.new !== passwords.confirm}
                                                    className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[13px] font-semibold rounded-lg disabled:opacity-50"
                                                    onClick={() => setIsChangingPassword(false)}
                                                >
                                                    Simpan
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!isChangingPassword && (
                                        <div className="pt-4 text-left">
                                            {isEditingProfile ? (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => { setUserName(editedName); setIsEditingProfile(false); }}
                                                        className="flex-1 sm:flex-none px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[14px] rounded-xl active:scale-95"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditedName(userName); setIsEditingProfile(false); }}
                                                        className="px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 text-gray-600 font-semibold text-[14px] rounded-xl"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditingProfile(true)}
                                                    className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[14px] rounded-xl active:scale-95 shadow-md"
                                                >
                                                    Edit Profile
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'Subscription' && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-xl mx-auto py-2 md:py-4">
                                {/* Elegant Header Section */}
                                <div className="text-center mb-6 md:mb-10">
                                    <h2 className="text-[24px] md:text-[32px] font-bold text-gray-900 dark:text-white mb-1 md:mb-2">Premium Plan</h2>
                                    <p className="text-gray-500 dark:text-gray-400 font-medium text-[14px] md:text-[16px]">Billed weekly at <span className="text-gray-900 dark:text-white font-bold">Rp10.000</span></p>
                                </div>

                                {/* Main Subscription Info */}
                                <div className="space-y-6 md:space-y-8 mb-8 md:mb-12">
                                    {/* Progress Section */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[12px] md:text-[14px] font-bold text-gray-400 uppercase tracking-widest">Sisa Masa Aktif</span>
                                            <span className="text-[14px] md:text-[16px] font-bold text-gray-900 dark:text-white">5 dari 7 Hari</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                                style={{ width: '71%' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Detailed Stats Rows */}
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
                                        <div className="py-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                                    <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <span className="text-[13px] md:text-[14px] text-gray-600 dark:text-gray-400 font-medium">Berakhir Pada</span>
                                            </div>
                                            <span className="text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-white">10 Maret 2026</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Action */}
                                <div className="flex justify-center mb-10 md:mb-16">
                                    <button className="w-full sm:w-auto px-8 md:px-12 py-3.5 md:py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[14px] md:text-[15px] rounded-2xl hover:bg-black dark:hover:bg-gray-100 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                                        Upgrade Paket Sekarang
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Simplified Redeem Footer */}
                                <div className="bg-gray-50/80 dark:bg-gray-800/80 rounded-2xl p-4 md:p-6 border border-gray-100 dark:border-gray-700">
                                    <label className="block text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Punya Kode Redeem?</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Masukkan kode"
                                            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 md:py-3 text-[14px] font-mono"
                                        />
                                        <button className="px-5 bg-green-500 text-white rounded-xl active:scale-95">
                                            <Gift className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
