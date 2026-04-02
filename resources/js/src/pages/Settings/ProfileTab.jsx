import { Check, Eye, EyeOff, Pencil } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import { useSettingsModal } from '@/context/SettingsModalContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function ProfileTab() {
  const { user, me, logout } = useAuth()
  const { showSnackbar } = useSnackbar()
  const { closeSettings } = useSettingsModal()

  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [userName, setUserName] = useState(user?.name)
  const [editedName, setEditedName] = useState(user?.name)
  const [phone, setPhone] = useState(user?.phone || '')
  const [editedPhone, setEditedPhone] = useState(user?.phone || '')

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })

  const passwordRequirements = [
    { id: 'length', text: 'Minimum 8 characters', check: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', text: 'Uppercase', check: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', text: 'lowercase', check: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'Contains number', check: (pwd) => /[0-9]/.test(pwd) },
  ]

  const userEmail = user?.email

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      showSnackbar('error', 'Nama tidak boleh kosong')
      return
    }
    if (loadingProfile) return
    setLoadingProfile(true)
    try {
      await request('/profiles', { method: 'PUT', body: { name: editedName, phone: editedPhone } })
      setUserName(editedName)
      setPhone(editedPhone)
      showSnackbar('success', 'Profil berhasil diperbarui')
      me()
      setIsEditingProfile(false)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current) {
      showSnackbar('error', 'Masukkan password lama')
      return
    }
    if (!passwordRequirements.every((r) => r.check(passwords.new))) {
      showSnackbar('error', 'Password baru tidak memenuhi syarat')
      return
    }
    if (passwords.new !== passwords.confirm) {
      showSnackbar('error', 'Konfirmasi password tidak cocok')
      return
    }
    if (loadingPassword) return
    setLoadingPassword(true)
    try {
      await request('/profiles/password', {
        method: 'PUT',
        body: { password_old: passwords.current, password: passwords.new },
      })
      showSnackbar('success', 'Password berhasil diubah')
      setPasswords({ current: '', new: '', confirm: '' })
      setIsChangingPassword(false)
      closeSettings()
      logout()
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
      <div className="px-6 md:px-10 py-8 space-y-10">
        {/* ── Profile Section ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              Profile
            </h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-[12px] mb-auto flex row gap-1 font-semibold text-[#2686D4] dark:text-[#F2901E] hover:underline"
              >
                Edit
                <Pencil className="w-3 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Account Name
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-[#2686D4] dark:border-[#F2901E] rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50">
                  {userName}
                </div>
              )}
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Number
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-white dark:bg-gray-800 border border-[#2686D4] dark:border-[#F2901E] rounded-lg px-3.5 py-2.5 text-[14px] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3.5 py-2.5 text-[14px] font-medium text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700/50">
                  {phone || <span className="text-gray-400">—</span>}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="bg-gray-50/60 dark:bg-gray-800/20 rounded-lg px-3.5 py-2.5 text-[14px] text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700/50">
                {userEmail}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Email tidak dapat diubah demi keamanan.
              </p>
            </div>
          </div>

          {isEditingProfile && (
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setEditedName(userName)
                  setEditedPhone(phone)
                  setIsEditingProfile(false)
                }}
                className="px-5 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold text-[13px] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loadingProfile}
                onClick={handleSaveProfile}
                className="px-5 py-2 bg-[#2686D4] dark:bg-[#F2901E] hover:scale-105 text-white font-semibold text-[13px] rounded-lg disabled:opacity-40 transition-colors"
              >
                {loadingProfile ? 'Saving...' : 'Save Change'}
              </button>
            </div>
          )}
        </section>

        {/* ── Security Section ── */}
        <section className="border-t border-gray-100 dark:border-gray-800 pt-8">
          <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-5">Security</h2>

          {!isChangingPassword ? (
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-xl">
              <div>
                <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                  Password
                </p>
                <p className="text-[12px] text-gray-400 mt-0.5">Ganti password akun kamu</p>
              </div>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 text-[12px] font-semibold text-[#2686D4] dark:text-[#F2901E] bg-white dark:bg-gray-800 border border-[#2686D4] dark:border-[#F2901E] rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors whitespace-nowrap"
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5 space-y-4">
              {/* Password lama */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Old Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3.5 py-2.5 font-mono text-[13px] text-gray-900 dark:text-white pr-10 outline-none focus:border-indigo-400 transition-colors"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                  <button
                    onClick={() =>
                      setShowPassword({ ...showPassword, current: !showPassword.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
              </div>

              {/* Password baru */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3.5 py-2.5 font-mono text-[13px] text-gray-900 dark:text-white pr-10 outline-none focus:border-indigo-400 transition-colors"
                    placeholder="Minimum 8 characters"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <button
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-2 gap-1.5 mt-2.5">
                  {passwordRequirements.map((req) => {
                    const ok = req.check(passwords.new)
                    return (
                      <div
                        key={req.id}
                        className={`flex items-center gap-1.5 text-[11px] font-medium ${ok ? 'text-green-500' : 'text-gray-400'}`}
                      >
                        {ok ? (
                          <Check size={11} strokeWidth={3} />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
                        )}
                        {req.text}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Konfirmasi */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={`w-full bg-white dark:bg-gray-900 border rounded-lg px-3.5 py-2.5 font-mono text-[13px] text-gray-900 dark:text-white outline-none transition-colors ${
                    passwords.confirm && passwords.new !== passwords.confirm
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-gray-200 dark:border-gray-700 focus:border-indigo-400'
                  }`}
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-[11px] text-red-400 mt-1">Password tidak cocok</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={
                    !passwords.current ||
                    !passwordRequirements.every((r) => r.check(passwords.new)) ||
                    passwords.new !== passwords.confirm ||
                    loadingPassword
                  }
                  onClick={handleChangePassword}
                  className="px-5 py-2 bg-[#2686D4] dark:bg-[#F2901E] hover:scale-105 font-semibold text-[13px] rounded-lg disabled:opacity-30 transition-all active:scale-95"
                >
                  {loadingPassword ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
