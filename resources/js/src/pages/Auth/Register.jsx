import AuthProvider from '@components/AuthProvider'
import { ArrowLeft, Eye, EyeOff, Loader2, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import lottieRegister from '@/assets/lottie/auth.json'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import AuthLayout from '@/layout/AuthLayout'
import { request } from '@/utils/Http'

const OTP_LENGTH = 6

export default function Register() {
  const { login } = useAuth()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('register') // 'register' | 'otp'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') ?? '',
  })

  const [turnstileToken, setTurnstileToken] = useState('')

  const turnstileRef = useRef(null)
  const turnstileWidgetId = useRef(null)

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  useEffect(() => {
    if (step !== 'register') return

    const siteKey = window.APP?.TURNSTILE_SITE_KEY
    if (!siteKey || !turnstileRef.current) return

    const cleanupWidget = () => {
      if (turnstileWidgetId.current === null) return
      if (!window.turnstile) return

      if (typeof window.turnstile.remove === 'function') {
        window.turnstile.remove(turnstileWidgetId.current)
      } else {
        window.turnstile.reset(turnstileWidgetId.current)
      }

      turnstileWidgetId.current = null
      if (turnstileRef.current) turnstileRef.current.innerHTML = ''
    }

    const renderWidget = () => {
      if (!window.turnstile || !turnstileRef.current) return

      cleanupWidget()

      turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        callback: (token) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
        theme: 'dark',
      })
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    const interval = setInterval(() => {
      if (!window.turnstile) return
      renderWidget()
      clearInterval(interval)
    }, 250)

    return () => {
      clearInterval(interval)
      cleanupWidget()
    }
  }, [step])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

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
    if (!turnstileToken) {
      showSnackbar('error', 'Silakan selesaikan verifikasi Turnstile')
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
          'cf-turnstile-response': turnstileToken,
          referral_code: formData.referralCode || undefined, // hanya kirim jika ada
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

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
    if (e.key === 'Enter') {
      e.preventDefault()
      handleVerifyOtp()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const newOtp = [...otp]
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i]
    setOtp(newOtp)
    const nextEmpty = newOtp.findIndex((v) => !v)
    inputRefs.current[nextEmpty >= 0 ? nextEmpty : OTP_LENGTH - 1]?.focus()
  }

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
        body: { email: formData.email, otp: code },
      })
      showSnackbar('success', 'Verifikasi berhasil! Selamat datang 🎉')
      login(res.token, res.user)
      navigate('/chat', { replace: true })
    } catch (err) {
      showSnackbar('error', err.message || 'Kode OTP tidak valid')
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    try {
      await request('/resend-otp', { method: 'POST', body: { email: formData.email } })
      showSnackbar('success', 'Kode OTP baru telah dikirim')
      setResendCooldown(60)
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengirim ulang OTP')
    }
  }

  /* ── Lottie config per step ── */
  const lottieProps =
    step === 'otp'
      ? {
          lottieText: 'Cek emailmu sekarang',
          lottieSub: `Kode OTP sudah dikirim ke ${formData.email}. Berlaku 5 menit.`,
        }
      : {
          lottieText: 'Bergabung dengan Pintaraja AI',
          lottieSub: 'Daftar gratis dan mulai belajar lebih cerdas hari ini.',
        }

  return (
    <AuthLayout lottieData={lottieRegister} {...lottieProps}>
      {/* ─── STEP 1: Register Form ─── */}
      {step === 'register' && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
            Join Pintaraja AI and start exploring smarter learning
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                required
              />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  field: 'password',
                  label: 'Password',
                  show: showPassword,
                  toggle: () => setShowPassword(!showPassword),
                },
                {
                  field: 'confirmPassword',
                  label: 'Confirm password',
                  show: showConfirmPassword,
                  toggle: () => setShowConfirmPassword(!showConfirmPassword),
                },
              ].map(({ field, label, show, toggle }) => (
                <div key={field}>
                  <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      name={field}
                      value={formData[field]}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 pr-9 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                    >
                      {show ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Referral Code <span className="text-gray-400 dark:text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="e.g AB3X9K2M"
                maxLength={10}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all uppercase"
                style={{ textTransform: 'uppercase' }}
              />
              {formData.referralCode && (
                <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Referral code will be applied
                </p>
              )}
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <div className="relative w-[300px] h-[65px]">
                <div className="absolute inset-0 flex items-center gap-3 px-3.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="w-7 h-7 rounded-full skeleton flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="skeleton h-2.5 w-[55%] rounded" />
                    <div className="skeleton h-2 w-[75%] rounded" />
                  </div>
                  <div className="skeleton w-[70px] h-7 rounded flex-shrink-0" />
                </div>

                <div ref={turnstileRef} className="absolute inset-0 z-10" />
              </div>

              <input type="hidden" name="cf-turnstile-response" value={turnstileToken} readOnly />

              {!turnstileToken && (
                <p className="mt-2 text-xs text-red-500">
                  Please complete the Turnstile verification before proceeding.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
              <span className="text-xs text-gray-400 dark:text-gray-600">or</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
            </div>

            <AuthProvider />
          </form>

          <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4A90D9] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}

      {/* ─── STEP 2: OTP ─── */}
      {step === 'otp' && (
        <>
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={26} className="text-[#4A90D9]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Verify your email
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We sent a {OTP_LENGTH}-digit code to{' '}
              <span className="font-semibold text-[#4A90D9]">{formData.email}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5 mb-7">
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
                autoFocus={idx === 0}
                className={`w-11 h-13 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all
                  bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white
                  ${
                    digit
                      ? 'border-[#4A90D9] ring-2 ring-blue-500/15 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                  }
                  focus:border-[#4A90D9] focus:ring-2 focus:ring-blue-500/15`}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={otpLoading || otp.join('').length !== OTP_LENGTH}
            className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
          >
            {otpLoading && <Loader2 size={15} className="animate-spin" />}
            {otpLoading ? 'Verifying…' : 'Verify code'}
          </button>

          <div className="mt-5 text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Resend in{' '}
                <span className="font-semibold tabular-nums text-gray-600 dark:text-gray-300">
                  {String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:
                  {String(resendCooldown % 60).padStart(2, '0')}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-sm text-[#4A90D9] font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto"
              >
                <RefreshCw size={13} />
                Resend code
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setStep('register')
              setOtp(Array(OTP_LENGTH).fill(''))
            }}
            className="mt-5 w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to registration
          </button>
        </>
      )}
    </AuthLayout>
  )
}
