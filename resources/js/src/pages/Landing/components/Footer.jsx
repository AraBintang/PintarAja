import { Link } from 'react-router-dom'

const websiteLinks = [
  { label: 'Layanan', href: '#layanan' },
  { label: 'Tentang Kami', href: '#tentang' },
  { label: 'Pencapaian', href: '#pencapaian' },
  { label: 'Keunggulan', href: '#keunggulan' },
  { label: 'Testimoni', href: '#testimoni' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Kontak', href: '#kontak' },
]

const serviceLinks = [
  { label: 'AI Chat', href: '#' },
  { label: 'AI Writer', href: '#' },
  { label: 'Humanizer AI', href: '#' },
  { label: 'Parafrase AI', href: '#' },
  { label: 'Transcribe AI', href: '#' },
  { label: 'Program Afiliasi', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-[#f8f9fc] dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-end gap-0 mb-3">
              <img src="/p doank.png" alt="Pintaraja" className="w-9 h-9 object-contain" />
              <div className="leading-tight">
                <span className="font-bold text-[#0a192f] dark:text-white text-[16px] block pb-[1.5px] -ml-[3px]">
                  intaraja
                </span>
                <span className="text-[10px] text-gray-400 block">Guided Until Proficient</span>
              </div>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-[14px] leading-relaxed">
              Platform AI tools untuk membantu mahasiswa lebih produktif
            </p>
          </div>

          {/* Website */}
          <div>
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
            </ul>
          </div>

          {/* Layanan */}
          <div>
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
          <div>
            <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-5">
              SOCIAL MEDIA
            </h4>
            <div className="flex gap-3">
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
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-center text-[13px] text-gray-400 dark:text-gray-500">
            © Pintaraja 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
