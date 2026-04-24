import { useNavigate } from 'react-router-dom'

import useScrollReveal from '@/hooks/useScrollReveal'

const websiteLinks = [
  { label: 'Layanan', href: '#layanan' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
]

const serviceLinks = [
  { label: 'AI Chat', href: 'login' },
  { label: 'AI Writer', href: 'login' },
  { label: 'Paraphrase AI', href: 'login' },
  { label: 'Humanizer AI', href: 'login' },
  { label: 'Transcribe AI', href: 'login' },
]

export default function Footer() {
  const navigate = useNavigate()
  const { ref: footerRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  return (
    <footer
      ref={footerRef}
      className="bg-[#f8f9fc] dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-700"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div
            className={`lg:col-span-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transition: 'opacity 0.6s ease, transform 0.6s ease' }}
          >
            <button onClick={() => navigate('/')} className="flex flex-col gap-1 cursor-pointer">
              <div className="flex items-end">
                <img src="/pintaraja.webp" alt="Pintaraja" className="w-7 h-7 object-contain" />
                <span className="text-base font-bold text-gray-900 dark:text-white -ml-1 -mb-1">
                  intaraja
                </span>
              </div>
            </button>
            <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">
              Platform AI tools untuk membantu mahasiswa lebih produktif
            </p>
          </div>

          {/* Website */}
          <div
            className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s' }}
          >
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-5">
              WEBSITE
            </h4>
            <ul className="space-y-3">
              {websiteLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-gray-600 dark:text-gray-400 hover:text-[#4A90D9] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/blog"
                  className="text-[14px] text-gray-600 dark:text-gray-400 hover:text-[#4A90D9] transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Layanan */}
          <div
            className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s' }}
          >
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-5">
              LAYANAN
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-gray-600 dark:text-gray-400 hover:text-[#4A90D9] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div
            className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transition: 'opacity 0.6s ease 0.3s, transform 0.6s ease 0.3s' }}
          >
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-5">
              SOCIAL MEDIA
            </h4>
            <div className="flex gap-3">
              {/* Tiktok */}
              <a
                href="https://www.tiktok.com/@pintaraja.com"
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-[#4A90D9] hover:border-[#4A90D9] transition-colors group shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-gray-500 group-hover:text-white"
                >
                  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                  <g id="SVGRepo_iconCarrier">
                    {' '}
                    <path d="M16.8217 5.1344C16.0886 4.29394 15.6479 3.19805 15.6479 2H14.7293M16.8217 5.1344C17.4898 5.90063 18.3944 6.45788 19.4245 6.67608C19.7446 6.74574 20.0786 6.78293 20.4266 6.78293V10.2191C18.645 10.2191 16.9932 9.64801 15.6477 8.68211V15.6707C15.6477 19.1627 12.8082 22 9.32386 22C7.50043 22 5.85334 21.2198 4.69806 19.98C3.64486 18.847 2.99994 17.3331 2.99994 15.6707C2.99994 12.2298 5.75592 9.42509 9.17073 9.35079M16.8217 5.1344C16.8039 5.12276 16.7861 5.11101 16.7684 5.09914M6.9855 17.3517C6.64217 16.8781 6.43802 16.2977 6.43802 15.6661C6.43802 14.0734 7.73249 12.7778 9.32394 12.7778C9.62087 12.7778 9.9085 12.8288 10.1776 12.9124V9.40192C9.89921 9.36473 9.61622 9.34149 9.32394 9.34149C9.27287 9.34149 8.86177 9.36884 8.81073 9.36884M14.7244 2H12.2097L12.2051 15.7775C12.1494 17.3192 10.8781 18.5591 9.32386 18.5591C8.35878 18.5591 7.50971 18.0808 6.98079 17.3564"></path>{' '}
                  </g>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/pintarajaofficial?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-[#4A90D9] hover:border-[#4A90D9] transition-colors group shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 group-hover:text-white"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://id.linkedin.com/company/software-mahasiswa"
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-[#4A90D9] hover:border-[#4A90D9] transition-colors group shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 group-hover:text-white"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@softwaremahasiswa652/"
                className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-[#4A90D9] hover:border-[#4A90D9] transition-colors group shadow-sm"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500 group-hover:text-white"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          className={`border-t border-gray-200 dark:border-gray-700 pt-6 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.6s ease 0.4s' }}
        >
          <p className="text-center text-[13px] text-gray-400 dark:text-gray-500">
            © Pintaraja 2026. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
