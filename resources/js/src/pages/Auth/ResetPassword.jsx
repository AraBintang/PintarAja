import { Check, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import lottieReset from '@/assets/auth.json'
import { useSnackbar } from '@/context/SnackbarContext'
import AuthLayout from '@/layout/AuthLayout'
import { request } from '@/utils/Http'

const requirements = [
  { id: 'length', text: 'Minimal 8 karakter', check: (p) => p.length >= 8 },
  { id: 'uppercase', text: 'Mengandung huruf besar', check: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', text: 'Mengandung huruf kecil', check: (p) => /[a-z]/.test(p) },
  { id: 'number', text: 'Mengandung angka', check: (p) => /[0-9]/.test(p) },
]

export default function ResetPassword() {
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Read token & email from URL: /reset-password?token=xxx&email=user@example.com
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [loading, setLoading] = useState(false)
  const [passwords, setPasswords] = useState({ new: '', confirm: '' })
  const [show, setShow] = useState({ new: false, confirm: false })

  const allMet = requirements.every((r) => r.check(passwords.new))
  const passwordMatch = passwords.new === passwords.confirm && passwords.confirm.length > 0

  const handleSubmit = async () => {
    if (!allMet) {
      showSnackbar('error', 'Password baru tidak memenuhi syarat')
      return
    }
    if (!passwordMatch) {
      showSnackbar('error', 'Konfirmasi password tidak cocok')
      return
    }
    if (!token || !email) {
      showSnackbar('error', 'Link reset tidak valid atau sudah kadaluarsa')
      return
    }
    if (loading) return

    setLoading(true)
    try {
      await request('/new-password', {
        method: 'POST',
        body: {
          token,
          email,
          password: passwords.new,
          password_confirmation: passwords.confirm,
        },
      })
      showSnackbar('success', 'Password berhasil diubah! Silakan login.')
      navigate('/login', { replace: true })
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mereset password')
    } finally {
      setLoading(false)
    }
  }

  /* ── Invalid link guard ── */
  if (!token || !email) {
    return (
      <AuthLayout
        lottieData={lottieReset}
        lottieText="Link tidak valid"
        lottieSub="Link reset password yang kamu gunakan tidak valid atau sudah kadaluarsa."
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link tidak valid</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm shadow-blue-500/20"
          >
            Minta link baru
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      lottieData={lottieReset}
      lottieText="Buat password baru"
      lottieSub="Pilih password yang kuat dan mudah kamu ingat."
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Password baru</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
        Untuk akun <span className="font-semibold text-[#4A90D9]">{email}</span>
      </p>

      <div className="space-y-4">
        {/* New password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Password baru
          </label>
          <div className="relative">
            <input
              type={show.new ? 'text' : 'password'}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Minimal 8 karakter"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono placeholder:text-gray-400 dark:placeholder:text-gray-600 placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShow({ ...show, new: !show.new })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {show.new ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        {/* Requirements */}
        {passwords.new.length > 0 && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3.5 grid grid-cols-2 gap-2">
            {requirements.map((r) => {
              const ok = r.check(passwords.new)
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 text-[12px] font-medium transition-colors ${ok ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${ok ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-200 dark:bg-white/10'}`}
                  >
                    {ok ? (
                      <Check size={10} strokeWidth={3} />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                    )}
                  </div>
                  {r.text}
                </div>
              )
            })}
          </div>
        )}

        {/* Confirm password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Konfirmasi password
          </label>
          <div className="relative">
            <input
              type={show.confirm ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="••••••••"
              className={`w-full bg-gray-50 dark:bg-white/5 border text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 pr-10 text-sm font-mono placeholder:font-sans focus:outline-none focus:ring-2 transition-all
                ${
                  passwords.confirm && !passwordMatch
                    ? 'border-red-300 dark:border-red-700 focus:ring-red-500/15 focus:border-red-400'
                    : passwords.confirm && passwordMatch
                      ? 'border-emerald-300 dark:border-emerald-700 focus:ring-emerald-500/15 focus:border-emerald-400'
                      : 'border-gray-200 dark:border-white/10 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500'
                }`}
            />
            <button
              type="button"
              onClick={() => setShow({ ...show, confirm: !show.confirm })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {show.confirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {passwords.confirm && !passwordMatch && (
            <p className="mt-1.5 text-[12px] text-red-500 font-medium">Password tidak cocok</p>
          )}
          {passwordMatch && (
            <p className="mt-1.5 text-[12px] text-emerald-500 font-medium flex items-center gap-1">
              <Check size={11} strokeWidth={3} /> Password cocok
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allMet || !passwordMatch || loading}
          className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 mt-2"
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? 'Menyimpan…' : 'Simpan password baru'}
        </button>

        <p className="text-center text-[13px] text-gray-400 dark:text-gray-500">
          Ingat password lama?{' '}
          <Link to="/login" className="text-[#4A90D9] font-semibold hover:underline">
            Kembali ke login
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
