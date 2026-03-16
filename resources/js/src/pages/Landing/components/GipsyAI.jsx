import useScrollReveal from '@/hooks/useScrollReveal'

const tools = [
  {
    name: 'Google OAuth',
    desc: 'Autentikasi mudah dan cepat hanya dengan akun Google, tanpa perlu repot mengingat password tambahan.',
    icon: (
      <svg width="36" height="36" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    ),
  },
  {
    name: 'OpenAI',
    desc: 'OpenAI adalah model AI mutakhir yang mampu memahami bahasa alami dengan sangat baik dan memberikan respon yang relevan serta akurat.',
    logo: '/gpt-ai-icon.svg',
    darkInvert: true,
  },
  {
    name: 'Gemini',
    desc: 'Gemini adalah AI generatif buatan Google yang mampu memahami teks, gambar, dan kode secara multimodal untuk berbagai kebutuhan kreatif maupun teknis.',
    logo: '/google-gemini-icon.svg',
  },
  {
    name: 'DeepSeek',
    desc: 'DeepSeek dirancang untuk kemampuan reasoning dan pemrosesan teks tingkat lanjut, ideal untuk kebutuhan penelitian dan solusi enterprise.',
    logo: '/deepseek-ai-icon.svg',
  },
  {
    name: 'Claude',
    desc: 'Claude dirancang untuk interaksi percakapan alami, mampu menangani tugas-tugas seperti menjawab pertanyaan, menghasilkan teks dan kode, meringkas dokumen, dan bertukar pikiran.',
    logo: '/claude-ai-icon.svg',
  },
  {
    name: 'Qwen',
    desc: 'Qwen adalah model bahasa buatan Alibaba dengan kekuatan analisis dan pemahaman kontekstual yang baik, cocok untuk integrasi AI dalam aplikasi sehari-hari.',
    logo: '/qwen-ai-icon.svg',
  },
]

export default function GipsyAI() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <section ref={sectionRef} className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#8B5CF6] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#4A90D9] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`text-center mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transition: 'opacity 0.7s ease, transform 0.7s ease' }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full mb-6">
            Plugin Integration
          </span>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] tracking-tight mb-6">
            Terintegrasi dengan Tool Favorit Anda
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[17px] max-w-3xl mx-auto leading-relaxed">
            Nikmati fitur dan hasil yang beragam dari berbagai tool yang telah kami integrasikan
            untuk kemudahan dan efisiensi kerja Anda.
          </p>
        </div>

        {/* 3x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <div
              key={i}
              className={`group bg-[#f8f9fc] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 text-center hover:border-[#4A90D9]/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
                isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ transition: 'opacity 0.6s ease, transform 0.6s ease', transitionDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {tool.logo ? (
                    <img src={tool.logo} alt={tool.name} className={`w-9 h-9 object-contain${tool.darkInvert ? ' dark:invert' : ''}`} />
                  ) : (
                    tool.icon
                  )}
                </div>
                <h3 className="text-[18px] font-bold text-[#0a192f] dark:text-white mb-3 group-hover:text-[#4A90D9] transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed group-hover:text-gray-600 transition-colors">
                  {tool.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
