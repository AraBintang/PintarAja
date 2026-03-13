import AuthProvider from '@components/AuthProvider'
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, Monitor, Moon, RefreshCw, ShieldCheck, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTheme } from '@/context/ThemeContext'
import { request } from '@/utils/Http'

export default function Register() {
  const { theme, toggleTheme } = useTheme()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  /* ─── OTP ─── */
  const OTP_LENGTH = 6
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  /* ── Step 1: Submit registration ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    if (formData.password !== formData.confirmPassword) {
      showSnackbar('error', 'Password dan konfirmasi password tidak cocok')
      return
    }

    if (formData.password.length < 6) {
      showSnackbar('error', 'Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      await request('/register', {
        method: 'POST',
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
        },
      })
      showSnackbar('success', 'Kode OTP telah dikirim ke email Anda')
      setStep('otp')
      setResendCooldown(60)
    } catch (err) {
      showSnackbar('error', err.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  /* ── OTP input handlers ── */
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    // Arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return

    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i]
    }
    setOtp(newOtp)

    // Focus the next empty slot or last
    const nextEmpty = newOtp.findIndex((v) => !v)
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : OTP_LENGTH - 1]?.focus()
  }

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== OTP_LENGTH) {
      showSnackbar('error', 'Masukkan kode OTP lengkap')
      return
    }

    setOtpLoading(true)

    try {
      const res = await request('/verify-otp', {
        method: 'POST',
        body: {
          email: formData.email,
          otp: code,
        },
      })

      showSnackbar('success', 'Verifikasi berhasil! Selamat datang 🎉')

      if (res.token) {
        await login(res.token)
        navigate('/chat', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    } catch (err) {
      showSnackbar('error', err.message || 'Kode OTP tidak valid')
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setOtpLoading(false)
    }
  }

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    try {
      await request('/resend-otp', {
        method: 'POST',
        body: { email: formData.email },
      })

      showSnackbar('success', 'Kode OTP baru telah dikirim')
      setResendCooldown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengirim ulang OTP')
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
      <div className="mb-8 flex items-end gap-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <img src="/p doank.png" alt="Pintaraja" className="mb-1 w-10 h-10 object-contain" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight pb-[2px] -ml-[3px]">
          intaraja
        </span>
      </div>

      {/* ═══ STEP 1: Registration Form ═══ */}
      {step === 'register' && (
        <>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Your Account</h1>
            <p className="text-gray-500 dark:text-gray-400 text-[15px]">
              Join Pintaraja AI and start exploring smarter learning
            </p>
          </div>

          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <div className="mb-2">
                    <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Full Name
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Input full name"
                      className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl p-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="mb-2">
                    <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Email
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl p-3 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[15px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="mb-2">
                      <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Password
                      </label>
                    </div>
                    <div className="relative group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="mb-2">
                      <label className="text-[14px] font-semibold text-gray-700 dark:text-gray-300 ml-1">
                        Confirm Password
                      </label>
                    </div>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-gray-50/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-2xl p-3 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#4A90D9] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-[14px]"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      >
                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-60 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] my-2 text-[16px] flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Mendaftar...' : 'Create Account'}
                </button>

                <div className="flex items-center gap-3 mt-6">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">or</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                <AuthProvider />
              </form>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-[14px]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#4A90D9] font-bold hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </>
      )}

      {/* ═══ STEP 2: OTP Verification ═══ */}
      {step === 'otp' && (
        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white dark:bg-gray-800 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100/50 dark:border-gray-700/50">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-[#4A90D9]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifikasi Email
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Kami telah mengirim kode verifikasi {OTP_LENGTH} digit ke
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Mail className="w-4 h-4 text-[#4A90D9]" />
                <span className="text-sm font-bold text-[#4A90D9]">{formData.email}</span>
              </div>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-8">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  className={`
                    w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 outline-none transition-all duration-200
                    bg-gray-50/50 dark:bg-gray-700/50
                    text-gray-900 dark:text-white
                    ${digit
                      ? 'border-[#4A90D9] ring-4 ring-blue-500/10 bg-blue-50/30 dark:bg-blue-900/10'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                    focus:border-[#4A90D9] focus:ring-4 focus:ring-blue-500/10
                  `}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading || otp.join('').length !== OTP_LENGTH}
              className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-50 disabled:hover:bg-[#4A90D9] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] text-[16px] flex items-center justify-center gap-2"
            >
              {otpLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {otpLoading ? 'Memverifikasi...' : 'Verifikasi Kode'}
            </button>

            {/* Resend & Timer */}
            <div className="mt-6 text-center">
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Kirim ulang kode dalam{' '}
                  <span className="font-bold text-gray-600 dark:text-gray-300 tabular-nums">
                    {String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:
                    {String(resendCooldown % 60).padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-sm text-[#4A90D9] font-bold hover:underline flex items-center justify-center gap-1.5 mx-auto transition-all hover:gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Kirim Ulang Kode
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-6">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Tidak menerima kode?</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Help text */}
            <div className="mt-4 space-y-2 text-xs text-gray-400 dark:text-gray-500">
              <p>• Periksa folder Spam atau Junk di email Anda</p>
              <p>• Pastikan email <span className="font-semibold text-gray-500 dark:text-gray-400">{formData.email}</span> sudah benar</p>
              <p>• Kode OTP berlaku selama 5 menit</p>
            </div>

            {/* Back button */}
            <button
              onClick={() => {
                setStep('register')
                setOtp(Array(OTP_LENGTH).fill(''))
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke halaman registrasi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
