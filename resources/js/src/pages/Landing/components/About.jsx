import useScrollReveal from '@/hooks/useScrollReveal'
import { useState, useEffect, useRef } from 'react'
import Lottie from 'lottie-react'

export default function About() {
  const { ref: sectionRef, isVisible, inView } = useScrollReveal({ threshold: 0.1 })
  const [lottieData, setLottieData] = useState(null)
  const lottieRef = useRef(null)

  useEffect(() => {
    if (!isVisible || lottieData) return
    let isMounted = true
    fetch('/ai-services-animation.json')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setLottieData(data)
      })
      .catch((err) => console.error('Error loading Lottie animation:', err))
    return () => { isMounted = false }
  }, [isVisible, lottieData])

  useEffect(() => {
    if (!lottieRef.current) return
    if (inView) {
      lottieRef.current.play()
    } else {
      lottieRef.current.pause()
    }
  }, [inView, lottieData])

  return (
    <section id="tentang" ref={sectionRef} className="relative py-24 bg-[#f4f7fb] dark:bg-gray-900 overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4A90D9] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#6AB0F3] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <span
          className={`inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-8 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transition: 'opacity 0.6s ease, transform 0.6s ease' }}
        >
          Tentang Pintaraja
        </span>
        <h2
          className={`text-3xl md:text-[44px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6 max-w-4xl mx-auto tracking-tight ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s' }}
        >
          Platform AI untuk{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
            Produktivitas Mahasiswa
          </span>
        </h2>
        <p
          className={`text-gray-600 dark:text-gray-400 text-[18px] leading-relaxed max-w-3xl mx-auto mb-10 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s' }}
        >
          Pintaraja adalah platform berbasis AI yang membantu mahasiswa dalam membuat konten,
          mengembangkan ide, mengerjakan skripsi, hingga merangkum jurnal. Dengan terintegrasi
          berbagai model AI seperti OpenAI, Gemini, Claude, dan lainnya — semua kebutuhan akademik
          Anda ada di satu tempat.
        </p>
        <a
          href="#"
          className={`inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full hover:shadow-[0_4px_16px_rgba(74,144,217,0.3)] hover:-translate-y-0.5 transition-all mb-16 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s' }}
        >
          Pelajari Selengkapnya
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        {/* Animation Container */}
        <div
          className={`relative max-w-4xl mx-auto group ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
          }`}
          style={{ transition: 'opacity 0.9s ease 0.5s, transform 0.9s ease 0.5s' }}
        >
          <div className="relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {lottieData ? (
              <Lottie
                lottieRef={lottieRef}
                animationData={lottieData}
                loop
                autoplay={false}
                style={{ width: '100%', height: 350, maxHeight: '450px' }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <svg className="w-12 h-12 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p>Memuat animasi AI...</p>
              </div>
            )}
            <div className="absolute inset-0 border border-white/20 dark:border-white/5 rounded-[1.5rem] pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
