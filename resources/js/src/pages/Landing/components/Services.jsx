import Lottie from 'lottie-react'
import { useEffect, useRef, useState } from 'react'

import claudeAiIcon from '@/assets/icons/claude-ai-icon.svg'
import deepseekAiIcon from '@/assets/icons/deepseek-ai-icon.svg'
import googleGeminiIcon from '@/assets/icons/google-gemini-icon.svg'
import gptAiIcon from '@/assets/icons/gpt-ai-icon.svg'
import qwenAiIcon from '@/assets/icons/qwen-ai-icon.svg'
import lottieAi from '@/assets/lottie/ai.json'
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
    title: 'paraphrase AI',
    desc: 'Parafrase dan tingkatkan kualitas tulisan Anda dengan struktur kalimat yang lebih baik, profesional, dan bebas plagiarisme.',
    badge: 'BARU',
  },
  {
    title: 'Humanizer AI',
    desc: 'Ubah teks hasil AI menjadi tulisan yang natural dan tidak terdeteksi sebagai konten buatan mesin. Sempurna untuk lolos pengecekan plagiarisme.',
    badge: 'Coming Soon',
  },
  {
    title: 'Transcribe AI',
    desc: 'Ubah rekaman wawancara, seminar, atau materi kuliah menjadi teks secara akurat. Mendukung format audio dengan speaker labels dan timestamps.',
    badge: 'BARU',
  },
  {
    title: 'Check Plagiarism',
    desc: 'Deteksi plagiarisme dalam dokumen Anda dengan akurasi tinggi. Mendukung berbagai format file dan memberikan laporan detail.',
    badge: 'BARU',
  },
]

export default function Services() {
  const [openIndex, setOpenIndex] = useState(0)
  const { ref: sectionRef, isVisible, inView } = useScrollReveal({ threshold: 0.1 })

  const lottieRef = useRef(null)

  useEffect(() => {
    if (!lottieRef.current) return
    if (inView) {
      lottieRef.current.play()
    } else {
      lottieRef.current.pause()
    }
  }, [inView])

  return (
    <section
      id="layanan"
      ref={sectionRef}
      className="pt-8 pb-40 bg-[#f4f7fb] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left - Lottie Animation */}
          <div
            className={`relative group lg:sticky lg:top-24 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            style={{ transition: 'opacity 0.8s ease, transform 0.8s ease' }}
          >
            <div className="relative overflow-hidden pt-6">
              <Lottie
                lottieRef={lottieRef}
                animationData={lottieAi}
                loop
                autoplay={false}
                style={{ width: '100%', height: 420, maxHeight: '520px' }}
              />
            </div>
            {/* Relocated AI Tools */}
            <div className="mt-8 lg:mt-12">
              <p className="text-[#0a192f] dark:text-white font-bold text-lg">
                Didukung AI Terpopuler
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Solusi pintar untuk produktivitas Anda.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  {
                    name: 'Google OAuth',
                    icon: (
                      <svg width="24" height="24" viewBox="0 0 48 48">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                    ),
                  },
                  { name: 'OpenAI', logo: gptAiIcon, darkInvert: true },
                  { name: 'Gemini', logo: googleGeminiIcon },
                  { name: 'DeepSeek', logo: deepseekAiIcon },
                  { name: 'Claude', logo: claudeAiIcon },
                  { name: 'Qwen', logo: qwenAiIcon },
                ].map((tool, i) => (
                  <div
                    key={i}
                    title={tool.name}
                    className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center relative hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                  >
                    {tool.logo ? (
                      <img
                        src={tool.logo}
                        alt={tool.name}
                        className={`w-6 h-6 object-contain${tool.darkInvert ? ' dark:invert' : ''}`}
                      />
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
                  style={{
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    transitionDelay: `${0.4 + index * 0.1}s`,
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-4 sm:p-5 text-left group gap-3"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span
                        className={`text-[17px] font-bold transition-colors ${openIndex === index ? 'text-[#4A90D9]' : 'text-[#1a2d4a] dark:text-gray-100 group-hover:text-[#4A90D9]'}`}
                      >
                        {service.title}
                      </span>
                      {service.badge && (
                        <span className="px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[10px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'border-[#4A90D9] bg-[#4A90D9]/10 rotate-180' : 'border-gray-200 dark:border-gray-700 bg-gray-50 group-hover:border-[#4A90D9]/50'}`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className={
                          openIndex === index
                            ? 'text-[#4A90D9]'
                            : 'text-gray-400 group-hover:text-[#4A90D9]'
                        }
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-56 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-4 sm:p-5 pt-0 pr-8 sm:pr-12">
                      <p className="text-gray-600 dark:text-gray-400 text-[14px] sm:text-[15px] leading-relaxed mb-4">
                        {service.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <a
                          href="#kontak"
                          className="px-4 py-2 sm:px-5 text-[12px] sm:text-[13px] font-semibold text-white bg-[#4A90D9] rounded-full hover:bg-[#3A7BC8] transition-colors shadow-sm hover:shadow-md"
                        >
                          Coba Sekarang
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
