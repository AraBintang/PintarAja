import useScrollReveal from '@/hooks/useScrollReveal'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: 'Generate dokumen dengan customisasi luas dan sempurna menggunakan template prompt yang siap pakai.',
    color: '#F5A623',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E8607A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Diskusi dengan AI canggih yang sudah di-set sesuai role-nya dan mampu membaca serta memahami dokumen.',
    color: '#E8607A',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Kebebasan penuh dalam berkarya, dengan jaminan privasi data yang tinggi.',
    color: '#F5A623',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Tersedia berbagai paket dengan harga terjangkau untuk pelajar, mahasiswa, hingga profesional.',
    color: '#4ADE80',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: 'Mendukung input teks, gambar, dan dokumen untuk menghasilkan respons yang lebih kaya dan fleksibel.',
    color: '#60A5FA',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Pantau aktivitas dan kelola fitur dengan dashboard yang modern dan mudah digunakan.',
    color: '#F472B6',
  },
]

export default function StatsAdvantages() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <section id="keunggulan" ref={sectionRef} className="relative py-24 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#4A90D9] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#F5A623] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div
          className={`text-center mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transition: 'opacity 0.7s ease, transform 0.7s ease' }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full mb-6">
            AI Pintar untuk Produktivitas
          </span>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] tracking-tight mb-6">
            Bantu Mahasiswa Jadi Lebih Produktif, Tanpa Ribet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-[17px] max-w-3xl mx-auto leading-relaxed">
            Pintaraja dirancang untuk memudahkan kamu dalam menyelesaikan berbagai jenis tugas —
            mulai dari membuat konten, mengembangkan ide, mengerjakan skripsi, hingga merangkum
            jurnal. Semua ada dalam satu tempat.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Info Card */}
          <div
            className={`bg-gradient-to-br from-[#f0f4ff] to-[#f5f0ff] dark:from-gray-800 dark:to-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-10 relative overflow-hidden shadow-sm ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
            style={{ transition: 'opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4A90D9]/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 text-[12px] font-semibold text-[#F5A623] bg-[#F5A623]/10 border border-[#F5A623]/20 rounded-full mb-6">
                Professional for your need
              </span>
              <h3 className="text-2xl md:text-[30px] font-extrabold text-[#0a192f] dark:text-white leading-tight mb-4">
                Selesaikan Segalanya dengan Pintaraja
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed">
                Dengan berbagai fitur pendukung yang ada di Pintaraja, kamu dapat mengerjakan tugas
                kantor atau tugas kuliahmu dengan lebih cepat dan efisien
              </p>
            </div>
          </div>

          {/* Right - Feature List */}
          <div className="space-y-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`group flex items-start gap-4 bg-[#f8f9fc] dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-2xl p-5 hover:border-[#4A90D9]/20 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transition: 'opacity 0.6s ease, transform 0.6s ease', transitionDelay: `${0.3 + i * 0.1}s` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `${feature.color}15` }}
                >
                  {feature.icon}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-[14.5px] leading-relaxed group-hover:text-[#0a192f] dark:group-hover:text-white transition-colors">
                  {feature.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
