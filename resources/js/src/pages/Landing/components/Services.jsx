import { useState, useEffect, useRef } from 'react'
import Lottie from 'lottie-react'

import useScrollReveal from '@/hooks/useScrollReveal'

const services = [
  {
    title: 'AI Chat',
    desc: 'Diskusi interaktif dengan asisten AI tercanggih — didukung oleh OpenAI, Gemini, Claude, DeepSeek & Qwen. Cocok untuk riset, brainstorming, dan tanya jawab akademik.',
    badge: 'POPULER',
  },
  {
    title: 'AI Writer',
    desc: 'Tulis draf skripsi, esai, artikel ilmiah, dan dokumen akademik secara otomatis. Dilengkapi template prompt dan simpan workbook untuk produktivitas maksimal.',
    badge: null,
  },
  {
    title: 'Humanizer AI',
    desc: 'Ubah teks hasil AI menjadi tulisan yang natural dan tidak terdeteksi sebagai konten buatan mesin. Sempurna untuk lolos pengecekan plagiarisme.',
    badge: 'Coming Soon',
  },
  {
    title: 'Parafrase AI',
    desc: 'Parafrase dan tingkatkan kualitas tulisan Anda dengan struktur kalimat yang lebih baik, profesional, dan bebas plagiarisme.',
    badge: 'BARU',
  },
  {
    title: 'Transcribe AI',
    desc: 'Ubah rekaman wawancara, seminar, atau materi kuliah menjadi teks secara akurat. Mendukung format audio dengan speaker labels dan timestamps.',
    badge: 'BARU',
  },
]

export default function Services() {
  const [openIndex, setOpenIndex] = useState(0)
  const { ref: sectionRef, isVisible, inView } = useScrollReveal({ threshold: 0.1 })
  const [lottieData, setLottieData] = useState(null)
  const lottieRef = useRef(null)

  useEffect(() => {
    if (!isVisible || lottieData) return
    let isMounted = true
    fetch('/Artificial Intelligence (AI).json')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setLottieData(data)
      })
      .catch(() => {
        if (isMounted) setLottieData(null)
      })
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
    <section
      id="layanan"
      ref={sectionRef}
      className="py-24 bg-[#f4f7fb] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left - Lottie Animation */}
          <div
            className={`relative group lg:sticky lg:top-24 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            style={{ transition: 'opacity 0.8s ease, transform 0.8s ease' }}
          >
            <div className="relative overflow-hidden pt-6">
              {lottieData ? (
                <Lottie
                  lottieRef={lottieRef}
                  animationData={lottieData}
                  loop
                  autoplay={false}
                  style={{ width: '100%', height: 420, maxHeight: '520px' }}
                />
              ) : (
                <div className="w-full h-[420px] lg:h-[520px] flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#4A90D9]/10 flex items-center justify-center">
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#4A90D9]">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">AI Tools Dashboard</p>
                  </div>
                </div>
              )}
            </div>
            {/* Relocated AI Tools */}
            <div className="mt-8 lg:mt-12">
              <p className="text-[#0a192f] dark:text-white font-bold text-lg">Didukung AI Terpopuler</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">Solusi pintar untuk produktivitas Anda.</p>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { name: 'Google OAuth', icon: (
                    <svg width="24" height="24" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  )},
                  { name: 'OpenAI', logo: '/gpt-ai-icon.svg', darkInvert: true },
                  { name: 'Gemini', logo: '/google-gemini-icon.svg' },
                  { name: 'DeepSeek', logo: '/deepseek-ai-icon.svg' },
                  { name: 'Claude', logo: '/claude-ai-icon.svg' },
                  { name: 'Qwen', logo: '/qwen-ai-icon.svg' }
                ].map((tool, i) => (
                  <div key={i} title={tool.name} className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center relative hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    {tool.logo ? (
                      <img src={tool.logo} alt={tool.name} className={`w-6 h-6 object-contain${tool.darkInvert ? ' dark:invert' : ''}`} />
                    ) : (
                      tool.icon
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Service List */}
          <div>
            <span
              className={`inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-6 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}
            >
              Produk dan Jasa
            </span>
            <h2
              className={`text-3xl md:text-[40px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-10 tracking-tight ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transition: 'opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s' }}
            >
              Layanan Berkualitas dari{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
                Pintaraja
              </span>
            </h2>

            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transition: 'opacity 0.6s ease, transform 0.6s ease', transitionDelay: `${0.4 + index * 0.1}s` }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-5 text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[17px] font-bold transition-colors ${openIndex === index ? 'text-[#4A90D9]' : 'text-[#1a2d4a] dark:text-gray-100 group-hover:text-[#4A90D9]'}`}
                      >
                        {service.title}
                      </span>
                      {service.badge && (
                        <span className="px-3 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full uppercase tracking-wider shadow-sm">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'border-[#4A90D9] bg-[#4A90D9]/10 rotate-180' : 'border-gray-200 dark:border-gray-700 bg-gray-50 group-hover:border-[#4A90D9]/50'}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={openIndex === index ? 'text-[#4A90D9]' : 'text-gray-400 group-hover:text-[#4A90D9]'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-5 pt-0 pr-12">
                      <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">
                        {service.desc}
                      </p>
                      <div className="flex gap-3">
                        <a href="#" className="px-5 py-2 text-[13px] font-semibold text-[#4A90D9] bg-[#4A90D9]/10 rounded-full hover:bg-[#4A90D9]/20 transition-colors">
                          Lihat Selengkapnya
                        </a>
                        <a href="#kontak" className="px-5 py-2 text-[13px] font-semibold text-white bg-[#4A90D9] rounded-full hover:bg-[#3A7BC8] transition-colors shadow-sm hover:shadow-md">
                          Pesan Sekarang
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
