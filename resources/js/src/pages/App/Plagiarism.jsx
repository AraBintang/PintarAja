import Lottie from 'lottie-react'
import { Link } from 'react-router-dom'

import lottiePaperPlane from '@/assets/lottie/paperPlane.json'

export default function PlagiarismPage() {
  return (
    <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#0f141e] p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background Grid & Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dotted Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-gray-900 dark:text-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-blue-500/40 dark:bg-orange-500/40 animate-blob" />
        <div
          className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-purple-500/40 dark:bg-amber-500/40 animate-float"
          style={{ animationDelay: '-2s' }}
        />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-blue-600/60 dark:bg-orange-600/60 animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full bg-blue-500/40 dark:bg-yellow-500/30 animate-blob"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute top-10 right-10 w-24 h-24 rounded-full border border-blue-500/20 dark:border-orange-500/20 animate-float"
          style={{ animationDelay: '-1s' }}
        />
        <div
          className="absolute bottom-10 left-10 w-32 h-32 rounded-full border border-blue-500/20 dark:border-orange-500/20 animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      <div className="flex-1 flex flex-col-reverse mt-12 md:mt-0 md:flex-row items-center justify-center gap-x-12 z-10 max-w-6xl mx-auto w-full relative">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 dark:from-orange-400 dark:to-yellow-400 transition-colors duration-300 pb-2">
            Coming
            <br />
            Soon!
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-gray-600 dark:text-gray-400 max-w-md mx-auto md:mx-0 transition-colors duration-300">
            This page is still under development. Our next feature will be coming soon!
          </p>
          <Link
            to="/chat"
            className="inline-block px-10 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold rounded-full text-sm tracking-wider uppercase shadow-lg shadow-blue-500/30 dark:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Go to AI Chat
          </Link>
        </div>

        {/* Illustration */}
        <Lottie
          animationData={lottiePaperPlane}
          loop
          autoplay
          className="h-80 w-80 md:h-140 md:w-140"
        />
      </div>
    </div>
  )
}
