import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock, Mail, Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useSnackbar } from '@/context/SnackbarContext'
import { useTheme } from '@/context/ThemeContext'
import { request } from '@/utils/Http'

export default function ForgotPassword() {
  const { theme, toggleTheme } = useTheme()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  /* ─── Step: 'email' | 'check' | 'reset' ─── */
  const [step, setStep] = useState('email')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  /* ─── Reset password form ─── */
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: '',
  })
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  })

  const passwordRequirements = [
    { id: 'length', text: 'Minimal 8 karakter', check: (pwd) => pwd.length >= 8 },
    { id: 'uppercase', text: 'Mengandung huruf besar', check: (pwd) => /[A-Z]/.test(pwd) },
    { id: 'lowercase', text: 'Mengandung huruf kecil', check: (pwd) => /[a-z]/.test(pwd) },
    { id: 'number', text: 'Mengandung angka', check: (pwd) => /[0-9]/.test(pwd) }
  ]

  const allRequirementsMet = passwordRequirements.every((r) => r.check(passwords.new))
  const passwordsMatch = passwords.new === passwords.confirm && passwords.confirm.length > 0

  /* ── Step 1: Send reset link ── */
  const handleSendLink = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      await request('/forgot-password', {
        method: 'POST',
        body: { email },
      })
      showSnackbar('success', 'Link reset telah dikirim ke email Anda')
      setStep('check')
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengirim link reset')
    } finally {
      setLoading(false)
    }
  }

  /* ── Step 3: Submit new password ── */
  const handleResetPassword = async () => {
    if (!allRequirementsMet) {
      showSnackbar('error', 'Password baru tidak memenuhi syarat')
      return
    }
    if (!passwordsMatch) {
      showSnackbar('error', 'Konfirmasi password tidak cocok')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      await request('/reset-password', {
        method: 'POST',
        body: {
          email,
          password: passwords.new,
          password_confirmation: passwords.confirm,
        },
      })

      showSnackbar('success', 'Password berhasil diubah! Silakan login')
      navigate('/login', { replace: true })
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mereset password')
    } finally {
      setLoading(false)
    }
  }

  /* ── Resend email ── */
  const handleResend = async () => {
    try {
      await request('/forgot-password', {
        method: 'POST',
        body: { email },
      })
      showSnackbar('success', 'Link reset telah dikirim ulang')
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengirim ulang')
    }
  }

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f5] dark:bg-gray-900 p-6 font-sans transition-colors duration-300">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all border border-gray-100 dark:border-gray-700"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      {/* Logo */}
      <div className="mb-8 flex items-end gap-0">
        <img src="/p doank.png" alt="Pintaraja" className="mb-1 w-10 h-10 object-contain" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight pb-[2px] -ml-[3px]">
          intaraja
        </span>
      </div>

      {/* ═══ STEP 1: Email Input ═══ */}
      {step === 'email' && (
        <>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[15px]">
              Masukkan email Kamu untuk menerima link reset password
            </p>
          </div>

          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
              <form onSubmit={handleSendLink} className="space-y-6">
                <div className="space-y-2">
                  <div className="mb-2">
                    <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Email
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4A90D9] transition-colors">
                      <Mail className="w-5 h-5" />
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
                  disabled={loading}
                  className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-60 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2 text-[16px] flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-[14px]">
                Ingat password Kamu?{' '}
                <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                  Kembali ke Login
                </Link>
              </p>
            </div>
          </div>
        </>
      )}

      {/* ═══ STEP 2: Check Email ═══ */}
      {step === 'check' && (
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
            <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#4A90D9] flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Cek Email Kamu
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-4">
                Kami telah mengirimkan link reset password ke{' '}
                <span className="font-bold text-gray-900 dark:text-white">{email}</span>
              </p>

              <button
                onClick={handleResend}
                className="text-[#4A90D9] font-bold hover:underline text-[14px]"
              >
                Tidak menerima email? Kirim ulang
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-[14px]">
              Ingat password Kamu?{' '}
              <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                Kembali ke Login
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: Reset Password Form ═══ */}
      {step === 'reset' && (
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#4A90D9]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Buat Password Baru
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Untuk akun <span className="font-bold text-[#4A90D9]">{email}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50 space-y-6">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Password Baru</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Password Baru */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block ml-1">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 pr-12 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all"
                  placeholder="Minimal 8 karakter"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPassword.new ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Ketentuan Password
              </p>
              <div className="grid grid-cols-1 gap-2">
                {passwordRequirements.map((req) => {
                  const isValid = req.check(passwords.new)
                  return (
                    <div
                      key={req.id}
                      className={`flex items-center gap-2.5 text-[12px] font-semibold transition-all duration-200 ${
                        isValid ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {isValid ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                        </div>
                      )}
                      {req.text}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Konfirmasi Password Baru */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block ml-1">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  className={`w-full bg-gray-50/50 dark:bg-gray-700/50 border text-gray-900 dark:text-white rounded-2xl px-4 py-3.5 pr-12 font-mono text-sm focus:outline-none focus:ring-4 transition-all ${
                    passwords.confirm && !passwordsMatch
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500/10 focus:border-red-400'
                      : passwords.confirm && passwordsMatch
                        ? 'border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500/10 focus:border-emerald-400'
                        : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500/10 focus:border-[#4A90D9]'
                  }`}
                  placeholder="••••••••"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPassword.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {passwords.confirm && !passwordsMatch && (
                <p className="text-[11px] text-red-500 font-medium ml-1 animate-in fade-in duration-200">
                  Password tidak cocok
                </p>
              )}
              {passwordsMatch && (
                <p className="text-[11px] text-emerald-500 font-medium ml-1 flex items-center gap-1 animate-in fade-in duration-200">
                  <Check size={12} strokeWidth={3} />
                  Password cocok
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleResetPassword}
              disabled={
                !allRequirementsMet ||
                !passwordsMatch ||
                loading
              }
              className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-40 disabled:hover:bg-[#4A90D9] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-[16px] flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>

            {/* Back button */}
            <button
              onClick={() => setStep('check')}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-[14px]">
              Ingat password Kamu?{' '}
              <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                Kembali ke Login
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
