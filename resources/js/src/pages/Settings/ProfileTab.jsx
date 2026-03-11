import { Check, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/context/AuthContext'

export default function ProfileTab() {
  const { user } = useAuth()

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [userName, setUserName] = useState(user?.name)
  const [editedName, setEditedName] = useState(user?.name)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })

  const passwordRequirements = [
    { id: 'length', text: 'Minimal 8 karakter', check: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', text: 'Mengandung huruf besar', check: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', text: 'Mengandung huruf kecil', check: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'Mengandung angka', check: (pwd) => /[0-9]/.test(pwd) },
  ]

  const userEmail = user?.email

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10">
      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informasi Profil</h2>

          <div className="space-y-6">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nama Akun
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800/50 border border-indigo-200 dark:border-indigo-900/50 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-900 dark:text-white outline-none ring-2 ring-indigo-500/10 transition-all"
                  autoFocus
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between group">
                  <span className="text-[15px] font-medium text-gray-900 dark:text-white">
                    {userName}
                  </span>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Ubah
                  </button>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Alamat Email
              </label>
              <div className="bg-gray-100/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-xl px-4 py-3">
                <span className="text-[15px] font-medium text-gray-400 dark:text-gray-500">
                  {userEmail}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 italic">
                Email tidak dapat diubah demi keamanan.
              </p>
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex items-center gap-3 mt-6 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  setUserName(editedName)
                  setIsEditingProfile(false)
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-[14px] rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all"
              >
                Simpan Nama
              </button>
              <button
                onClick={() => {
                  setEditedName(userName)
                  setIsEditingProfile(false)
                }}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-[14px] rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                Batal
              </button>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Keamanan</h2>

          {!isChangingPassword ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl gap-4">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Kata Sandi</p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400">
                  Terakhir diubah 2 bulan yang lalu
                </p>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-5 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold text-[13px] rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                Ganti Password
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 md:p-8 space-y-6 animate-in slide-in-from-top-4 duration-300">
              <div className="grid gap-5">
                <div className="space-y-1.5 text-left">
                  <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Password Lama
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-sm"
                      placeholder="••••••••"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    />
                    <button
                      onClick={() =>
                        setShowPassword({ ...showPassword, current: !showPassword.current })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-sm"
                      placeholder="Minimal 8 karakter"
                      value={passwords.new}
                      onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    />
                    <button
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordRequirements.map((req) => {
                    const isValid = req.check(passwords.new)
                    return (
                      <div
                        key={req.id}
                        className={`flex items-center gap-2 text-[11px] font-semibold ${isValid ? 'text-green-500' : 'text-gray-400'}`}
                      >
                        {isValid ? (
                          <Check size={14} strokeWidth={3} />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-1" />
                        )}
                        {req.text}
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-1.5 text-left pt-2">
                  <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    className={`w-full bg-white dark:bg-gray-900 border ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'} rounded-xl px-4 py-3 font-mono text-sm`}
                    placeholder="••••••••"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  disabled={
                    !passwords.current ||
                    !passwordRequirements.every((r) => r.check(passwords.new)) ||
                    passwords.new !== passwords.confirm
                  }
                  className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm rounded-xl disabled:opacity-30 transition-all active:scale-95"
                >
                  Simpan Password
                </button>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
