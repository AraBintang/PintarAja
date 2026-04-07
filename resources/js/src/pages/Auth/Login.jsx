import AuthProvider from '@components/AuthProvider'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import lottieAI from '@/assets/lottie/auth.json'
import { useAuth } from '@/context/AuthContext'
import AuthLayout from '@/layout/AuthLayout'
import { request } from '@/utils/Http'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await request('/login', {
        method: 'POST',
        body: { email, password, remember },
      })
      login(res.token, res.user)
      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      lottieData={lottieAI}
      lottieText="Masuk dan mulai eksplorasi"
      lottieSub="Tanyakan apa saja ke Pintaraja — dari pelajaran sulit hingga ide kreatif."
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
        Sign in to continue using Pintaraja
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-3.5 py-2.5 pr-10 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-blue-500"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-[13px] font-medium text-amber-500 hover:text-amber-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] shadow-sm shadow-blue-500/20"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
          <span className="text-xs text-gray-400 dark:text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
        </div>

        <AuthProvider />
      </form>

      <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-gray-500">
        Don't have an account?{' '}
        <Link to="/register" className="text-[#4A90D9] font-semibold hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}
