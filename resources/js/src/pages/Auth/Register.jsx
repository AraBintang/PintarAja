import AuthProvider from '@components/AuthProvider'
import { Eye, EyeOff, Monitor, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useTheme } from '@/context/ThemeContext'

export default function Register() {
  const { theme, toggleTheme } = useTheme()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await request('/login', {
        method: 'POST',
        body: {
          email,
          password,
          remember,
        },
      })

      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      navigate('/chat', { replace: true })
    } catch (err) {
      setError(err.message || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f7f5] dark:bg-gray-900 p-6 font-sans transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all border border-gray-100 dark:border-gray-700"
      >
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </button>

      <div className="mb-8 flex items-end gap-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <img src="/p doank.png" alt="Pintaraja" className="mb-1 w-10 h-10 object-contain" />
        <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight pb-[2px] -ml-[3px]">
          intaraja
        </span>
      </div>

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
              className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] my-2 text-[16px]"
            >
              Create Account
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
    </div>
  )
}
