import { Link } from 'react-router-dom'

import useScrollReveal from '@/hooks/useScrollReveal'

const reviews = [
  {
    title: 'Bagus untuk Pemula',
    text: 'Membantu saya yang masih awam terhadap penelitian.',
    name: 'Arya Aji Pradana',
    service: 'Kelas Online',
    initials: 'AA',
  },
  {
    title: 'Fast Respons',
    text: 'Teruss mengusahakann request an customer, on time jugaa. Mantapp pokonyaa!',
    name: 'Thania Agnestiana',
    service: 'Olah Data Statistik',
    initials: 'TA',
  },
  {
    title: 'Mudah Dipahami',
    text: 'Sangat cocok untuk yang masih pemula/awam dengan penelitian.',
    name: 'Bachtiar Rizqi Ihsani',
    service: 'Kelas Online',
    initials: 'BR',
  },
  {
    title: 'Sesuai Ekspektasi',
    text: 'Penilaian dosen juga memuaskan dari hasil olah data tersebut dan pembuatan artikel penelitian.',
    name: 'Brinda Angelica Prakoso',
    service: 'Olah Data Statistik & Konsultasi Riset',
    initials: 'BA',
  },
  {
    title: 'Sesuai Permintaan Klien',
    text: 'Pelayanannya sangat ramah, dan penjelasannya sangat mudah dimengerti',
    name: 'Siau Ling',
    service: 'Olah Data Statistik',
    initials: 'SL',
  },
  {
    title: 'Sangat Terbantu',
    text: 'Helpful sekalii alhamdulillah. Aku merasa sangat terbantu.',
    name: 'Prinia',
    service: 'Konsultasi & Olah Data Statistik',
    initials: 'PR',
  },
]

const Stars = () => (
  <div className="flex gap-1 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#F5A623" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
)

export default function Testimonials() {
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <section
      id="testimoni"
      ref={sectionRef}
      className="relative py-28 bg-[#f4f7fb] dark:bg-gray-900 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4A90D9] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#6AB0F3] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-12 items-start">
          {/* Left - Title */}
          <div
            className={`relative z-20 lg:sticky lg:top-32 pt-8 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
            style={{ transition: 'opacity 0.8s ease, transform 0.8s ease' }}
          >
            <span className="inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-6">
              Testimoni
            </span>
            <h2 className="text-3xl md:text-[40px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6">
              Apa Kata Mereka yang{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
                Telah Terbantu
              </span>
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm">
              Ratusan klien telah memberikan ulasan positif terhadap layanan kami.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Daftar Sekarang
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Right - Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8">
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 sm:p-7 hover:border-[#4A90D9]/20 hover:shadow-lg transition-all duration-300 relative overflow-hidden flex flex-col ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transition: 'opacity 0.6s ease, transform 0.6s ease',
                  transitionDelay: `${0.2 + i * 0.1}s`,
                }}
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#4A90D9] to-[#6AB0F3] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <Stars />
                <h4 className="text-[#0a192f] dark:text-white font-bold text-[16px] mb-3 leading-snug">
                  {review.title}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed mb-6 flex-grow">
                  {review.text}
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4A90D9] to-[#6AB0F3] flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform">
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-[#0a192f] dark:text-white text-[13px] font-bold group-hover:text-[#4A90D9] transition-colors">
                      {review.name}
                    </p>
                    <p className="text-[#4A90D9] text-[12px] font-medium">{review.service}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
