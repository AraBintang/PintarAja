import { useState } from 'react'

import useScrollReveal from '@/hooks/useScrollReveal'

const faqs = [
  {
    q: 'Apakah jasa & produk Pintaraja dikhususkan hanya untuk mahasiswa?',
    a: 'Tidak, Pintaraja juga terbuka untuk melayani klien selain mahasiswa, seperti dosen, karyawan swasta, pemilik bisnis, dan lain-lain. Untuk informasi lebih lanjut, hubungi kami.',
  },
  {
    q: 'Apa saja produk dan jasa yang disediakan oleh Pintaraja?',
    a: 'Pintaraja menyediakan AI Chat, AI Writer, Humanizer AI, Parafrase AI, dan Transcribe AI untuk kebutuhan riset, penulisan, dan produktivitas akademik.',
  },
  {
    q: 'Bagaimana cara melakukan pemesanan produk atau jasa dari Pintaraja?',
    a: 'Anda bisa langsung mendaftar di website kami dan memilih paket langganan yang sesuai melalui halaman Subscription.',
  },
  {
    q: 'Bagaimana mekanisme pembayaran produk atau jasa dari Pintaraja?',
    a: 'Pembayaran dapat dilakukan melalui QRIS, Virtual Account (BCA, BNI, BRI, Mandiri), e-wallet (OVO, DANA, GoPay, ShopeePay), dan gerai retail (Alfamart, Indomaret).',
  },
  {
    q: 'Apakah Pintaraja menjamin kerahasiaan data yang diperlukan dalam proses riset?',
    a: 'Ya, semua data klien dijamin kerahasiaannya. Kami mengutamakan privasi dan keamanan data dalam setiap proses riset.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-24 bg-[#f4f7fb] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 relative overflow-hidden"
    >
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6AB0F3] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#4A90D9] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div
          className={`text-center mb-16 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transition: 'opacity 0.7s ease, transform 0.7s ease' }}
        >
          <span className="inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-6">
            FAQ
          </span>
          <h2 className="text-3xl md:text-[40px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] tracking-tight">
            Pertanyaan Seputar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
              Pintaraja
            </span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? 'border-[#4A90D9]/30 shadow-md scale-[1.01]'
                  : 'border-gray-100 dark:border-gray-700 shadow-sm hover:border-[#4A90D9]/20 hover:shadow'
              } ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transition: 'opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, box-shadow 0.3s', transitionDelay: `${0.2 + index * 0.1}s` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left group"
              >
                <span className={`text-[15.5px] font-bold pr-4 transition-colors ${openIndex === index ? 'text-[#4A90D9]' : 'text-[#1a2d4a] dark:text-gray-100 group-hover:text-[#4A90D9]'}`}>
                  {faq.q}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  openIndex === index
                    ? 'bg-[#4A90D9] text-white rotate-180'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-300 group-hover:bg-[#4A90D9]/10 group-hover:text-[#4A90D9]'
                }`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 pt-0">
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
