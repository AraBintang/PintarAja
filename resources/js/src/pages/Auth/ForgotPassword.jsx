import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import lottieForgot from '@/assets/auth.json'
import { useSnackbar } from '@/context/SnackbarContext'
import AuthLayout from '@/layout/AuthLayout'
import { request } from '@/utils/Http'

export default function ForgotPassword() {
  const { showSnackbar } = useSnackbar()

  const [step, setStep] = useState('email') // 'email' | 'check'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

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

  const handleResend = async () => {
    try {
      await request('/forgot-password', { method: 'POST', body: { email } })
      showSnackbar('success', 'Link reset telah dikirim ulang')
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengirim ulang')
    }
  }

  const lottieProps =
    step === 'check'
      ? {
          lottieText: 'Cek inbox emailmu',
          lottieSub: 'Link reset password sudah kami kirim. Jangan lupa cek folder spam juga ya.',
        }
      : {
          lottieText: 'Lupa password?',
          lottieSub: 'Tenang, masukkan emailmu dan kami akan kirimkan link untuk reset password.',
        }

  return (
    <AuthLayout lottieData={lottieForgot} {...lottieProps}>
      {step === 'email' && (
        <>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7">
            Enter your email to receive a password reset link.
          </p>

          <form onSubmit={handleSendLink} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl pl-9 pr-3.5 py-2.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A90D9] hover:bg-[#3A7BC8] disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 mt-6"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-gray-400 dark:text-gray-500">
            Remember password?{' '}
            <Link to="/login" className="text-[#4A90D9] font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </>
      )}

      {step === 'check' && (
        <>
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
              <Mail size={26} className="text-[#4A90D9]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Check your email
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              We have sent a reset link to{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-white/5 rounded-xl p-4 mb-6">
            <p>
              • Check folders <span className="font-medium">Spam</span> or{' '}
              <span className="font-medium">Junk</span> if it's not in the inbox
            </p>
            <p>
              • Link valid for <span className="font-medium">60 minutes</span>
            </p>
            <p>
              • Make sure the email{' '}
              <span className="font-medium text-gray-600 dark:text-gray-400">{email}</span> is
              correct
            </p>
          </div>

          <button
            onClick={handleResend}
            className="w-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 font-semibold py-2.5 rounded-xl text-sm transition-all"
          >
            Re send Email
          </button>

          <button
            onClick={() => setStep('email')}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Use other email
          </button>
        </>
      )}
    </AuthLayout>
  )
}
