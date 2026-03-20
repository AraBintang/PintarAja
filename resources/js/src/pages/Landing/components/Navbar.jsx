import { Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useTheme } from '@/context/ThemeContext'

export default function Navbar() {
  const navigate = useNavigate()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Layanan', href: '#layanan' },
    { label: 'Harga', href: '#pricing' },
    { label: 'Tentang Kami', href: '#tentang' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg shadow-black/5 py-0' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex flex-col gap-1 cursor-pointer">
          <div className="flex items-end">
            <img src="/p doank.png" alt="Pintaraja" className="w-7 h-7 object-contain" />
            <span className="text-base font-bold text-gray-900 dark:text-white -ml-1 -mb-1">
              intaraja
            </span>
          </div>
          <span className="ml-1 text-[10px] block transition-colors duration-300 text-gray-400 dark:text-gray-500">
            Guided Until Proficient
          </span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-[14px] font-medium transition-colors duration-300 group text-gray-600 dark:text-gray-300 hover:text-[#4A90D9]"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#4A90D9] transition-all duration-300 group-hover:w-full rounded-full"></span>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all capitalize"
            title={`Tema: ${theme}`}
          >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'system' && <Monitor className="w-5 h-5" />}
          </button>
          <Link
            to="/login"
            className="px-6 py-2.5 text-[14px] font-semibold rounded-full transition-all border text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-[14px] font-semibold rounded-full shadow-[0_4px_12px_rgba(74,144,217,0.3)] hover:shadow-[0_4px_16px_rgba(74,144,217,0.5)] transition-all hover:-translate-y-0.5"
          >
            Daftar
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden transition-colors text-gray-700 dark:text-gray-300"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-6 py-4 space-y-3 shadow-xl absolute top-full left-0 right-0 animate-[fadeInUp_0.3s_ease-out]">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2 hover:text-[#4A90D9] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Link
              to="/login"
              className="block w-full text-center px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-full"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block w-full text-center px-6 py-3 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-sm font-semibold rounded-full shadow-md"
              onClick={() => setMobileOpen(false)}
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
