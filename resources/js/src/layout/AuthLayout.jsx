import Lottie from 'lottie-react'
import { Monitor, Moon, Sun } from 'lucide-react'

import { useTheme } from '@/context/ThemeContext'

export default function AuthLayout({ lottieData, lottieText, lottieSub, children }) {
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

      <div className="hidden md:flex md:w-1/2 lg:w-[55%] flex-col items-center justify-center px-12 py-16 relative z-10">
        <div className="absolute top-6 left-8 flex items-center gap-1">
          <img src="/p doank.png" alt="Pintaraja" className="w-7 h-7 object-contain" />
          <span className="text-base font-bold text-gray-900 dark:text-white -ml-1.5 -mb-1.5">
            intaraja
          </span>
        </div>

        <div className="w-full max-w-[380px] ml-30">
          {lottieData ? (
            <Lottie animationData={lottieData} loop autoplay />
          ) : (
            <div className="aspect-square rounded-3xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 flex items-center justify-center">
              <span className="text-5xl">✨</span>
            </div>
          )}
        </div>

        <div className="mt-6 text-center max-w-sm ml-30">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {lottieText ?? 'Selamat datang di Pintaraja AI'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {lottieSub ?? 'Platform AI untuk belajar lebih cerdas dan efisien.'}
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 mr-45">
        <div className="md:hidden flex items-center gap-1 mb-8">
          <img src="/p doank.png" alt="Pintaraja" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold text-gray-900 dark:text-white -ml-1.5 -mb-1.5">
            intaraja
          </span>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="bg-white/70 dark:bg-[#161b22]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/80 dark:border-white/8 shadow-xl shadow-black/5 dark:shadow-black/30">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
