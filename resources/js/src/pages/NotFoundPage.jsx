import Lottie from 'lottie-react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import Lottie404 from '@/assets/lottie/404.json'
import { useTheme } from '@/context/ThemeContext'

export default function AuthLayout() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-[#f0f2f5] dark:bg-[#0d1117] transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-[460px] h-[460px] rounded-full bg-indigo-200/35 dark:bg-indigo-900/20 blur-[110px]" />
        <div className="absolute -bottom-24 left-1/3 w-[380px] h-[380px] rounded-full bg-sky-200/30 dark:bg-sky-900/15 blur-[90px]" />
      </div>

      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 dark:bg-white/8 backdrop-blur border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all shadow-sm"
      >
        {theme === 'light' && <Sun size={15} />}
        {theme === 'dark' && <Moon size={15} />}
        {theme === 'system' && <Monitor size={15} />}
      </button>

      <div className="flex flex-col items-center justify-center mx-auto">
        <button
          onClick={() => navigate('/home')}
          className="absolute top-6 left-8 flex items-center gap-1 cursor-pointer"
        >
          <img src="/p doank.png" alt="Pintaraja" className="w-7 h-7 object-contain" />
          <span className="text-base font-bold text-gray-900 dark:text-white -ml-1.5 -mb-1.5">
            intaraja
          </span>
        </button>

        <div className="w-full max-w-[380px]">
          <Lottie animationData={Lottie404} loop autoplay className="h-100 w-100" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
          Uh oh. Page not found.
        </h2>

        <p className="text-center max-w-md text-[15px] leading-relaxed mb-8 text-gray-500 dark:text-gray-400">
          Visit our homepage which is indeed there{' '}
          <Link
            to="/chat"
            className="underline underline-offset-2 font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
          >
            Chat Page
          </Link>
        </p>

        <Link
          to="/chat"
          className="px-8 py-3 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-[15px] font-bold rounded-2xl shadow-[0_4px_20px_rgba(74,144,217,0.25)] hover:shadow-[0_4px_28px_rgba(74,144,217,0.4)] transition-all hover:scale-[1.02]"
        >
          Back to Chat
        </Link>
      </div>
    </div>
  )
}
