import { useNavigate } from 'react-router-dom'

import claudeAiIcon from '@/assets/icons/claude-ai-icon.svg'
import deepseekAiIcon from '@/assets/icons/deepseek-ai-icon.svg'
import googleGeminiIcon from '@/assets/icons/google-gemini-icon.svg'
import gptAiIcon from '@/assets/icons/gpt-ai-icon.svg'
import grokAiIcon from '@/assets/icons/grok-ai-icon.svg'
import qwenAiIcon from '@/assets/icons/qwen-ai-icon.svg'
import useScrollReveal from '@/hooks/useScrollReveal'

const tools = [
  {
    name: 'Google OAuth',
    desc: 'Autentikasi mudah dan cepat hanya dengan akun Google, tanpa perlu repot mengingat password tambahan.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 48 48">
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
  {
    name: 'OpenAI',
    desc: 'AI mutakhir yang mampu memahami bahasa alami dengan sangat baik dan memberikan respon yang relevan serta akurat.',
    logo: gptAiIcon,
    darkInvert: true,
    accent: '#10a37f',
  },
  {
    name: 'Gemini',
    desc: 'AI generatif buatan Google yang mampu memahami teks, gambar, dan kode secara multimodal untuk berbagai kebutuhan kreatif maupun teknis.',
    logo: googleGeminiIcon,
    accent: '#4285F4',
  },
  {
    name: 'Claude',
    desc: 'AI yang dirancang untuk interaksi percakapan alami, mampu menangani berbagai tugas seperti menjawab pertanyaan, menghasilkan teks dan kode, serta meringkas dokumen.',
    logo: claudeAiIcon,
    accent: '#cc785c',
  },
  {
    name: 'Grok',
    desc: 'AI buatan xAI milik Elon Musk yang dirancang untuk memberikan jawaban jujur dan tidak tersensor, dengan akses real-time ke platform X.',
    logo: grokAiIcon,
    darkInvert: true,
    accent: '#1DA1F2',
  },
  {
    name: 'DeepSeek',
    desc: 'AI yang dirancang untuk kemampuan reasoning dan pemrosesan teks tingkat lanjut, ideal untuk kebutuhan penelitian dan solusi enterprise.',
    logo: deepseekAiIcon,
    accent: '#4D6BFE',
  },
  {
    name: 'Qwen',
    desc: 'AI buatan Alibaba dengan kekuatan analisis dan pemahaman kontekstual yang baik, cocok untuk integrasi AI dalam aplikasi sehari-hari.',
    logo: qwenAiIcon,
    accent: '#6B48FF',
  },
]

export default function GipsyAI() {
  const navigate = useNavigate()

  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <section ref={sectionRef} className="relative py-28 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-[#4A90D9] opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-[#8B5CF6] opacity-[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`text-center mb-20 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 text-[12px] font-semibold tracking-widest uppercase text-[#4A90D9] bg-[#4A90D9]/10 border border-[#4A90D9]/20 rounded-full mb-8">
            ✦ Plugin Integration
          </span>
          <h2 className="text-4xl md:text-[52px] font-black text-[#0a192f] dark:text-white leading-[1.1] tracking-tight mb-6">
            Terintegrasi dengan
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-[#4A90D9] to-[#8B5CF6] bg-clip-text text-transparent">
                Tool Favorit Anda
              </span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-gradient-to-r from-[#4A90D9]/20 to-[#8B5CF6]/20 rounded-full blur-sm" />
            </span>
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-[16px] max-w-2xl mx-auto leading-relaxed">
            Nikmati fitur dan hasil yang beragam dari berbagai tool yang telah kami integrasikan
            untuk kemudahan dan efisiensi kerja Anda.
          </p>
        </div>

        {/* Flex grid — auto-centers last row regardless of count */}
        <div className="flex flex-wrap justify-center gap-5">
          {tools.map((tool, i) => {
            const accentColor = tool.accent || '#4A90D9'
            return (
              <div
                key={i}
                className={`cursor-pointer group relative w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${0.1 + i * 0.08}s` }}
                onClick={() => navigate('/login')}
              >
                {/* Card */}
                <div className="relative h-full bg-white dark:bg-[#13172a] border border-gray-100 dark:border-gray-800 rounded-2xl p-7 overflow-hidden hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300">
                  {/* Accent line top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                    }}
                  />

                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${accentColor}10 0%, transparent 60%)`,
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-start gap-4">
                    {/* Logo + Number */}
                    <div className="flex items-center justify-between w-full">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110"
                        style={{
                          background: `${accentColor}10`,
                          borderColor: `${accentColor}25`,
                        }}
                      >
                        {tool.logo ? (
                          <img
                            src={tool.logo}
                            alt={tool.name}
                            className={`w-8 h-8 object-contain${tool.darkInvert ? ' dark:invert' : ''}`}
                          />
                        ) : (
                          tool.icon
                        )}
                      </div>
                      <span className="text-[11px] font-bold tracking-widest text-gray-300 dark:text-gray-600 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Text */}
                    <div>
                      <h3
                        className="text-[17px] font-bold text-[#0a192f] dark:text-white mb-2 group-hover:transition-colors duration-300"
                        style={{ ['--hover-color']: accentColor }}
                      >
                        <span className="group-hover:text-[var(--hover-color)] transition-colors duration-300">
                          {tool.name}
                        </span>
                      </h3>
                      <p className="text-gray-400 dark:text-gray-500 text-[13.5px] leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>

                    {/* Bottom arrow */}
                    <div
                      className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                      style={{ color: accentColor }}
                    >
                      Explore
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2.5 6h7m0 0L6.5 3m3 3L6.5 9"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
