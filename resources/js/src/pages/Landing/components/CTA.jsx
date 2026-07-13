import { Link } from 'react-router-dom'

import useScrollReveal from '@/hooks/useScrollReveal'

export default function CTA() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.15 })

  return (
    <section
      id="kontak"
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-[#f0f4ff] via-[#e8eeff] to-[#f5f0ff] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 overflow-hidden border-t border-gray-100 dark:border-gray-700"
    >
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-[#4A90D9] opacity-[0.06] rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[300px] bg-[#a78bfa] opacity-[0.05] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2
          className={`text-3xl md:text-[48px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6 tracking-tight ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}
        >
          Siap Meningkatkan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
            Produktivitas
          </span>
          <br className="hidden md:block" />
          dengan AI?
        </h2>
        <p
          className={`text-gray-500 dark:text-gray-400 text-[18px] mb-10 max-w-2xl mx-auto leading-relaxed ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s' }}
        >
          Mulai gunakan berbagai AI tools Pintaraja untuk membuat konten, mengembangkan ide, dan
          menyelesaikan tugas akademik Anda.
        </p>

        <div
          className={`relative inline-block group ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s' }}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse" />
          <Link
            to="/register"
            className="relative inline-flex items-center gap-2 px-10 py-4 text-[16px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(74,144,217,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            Mulai Sekarang trial 1 hari
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
