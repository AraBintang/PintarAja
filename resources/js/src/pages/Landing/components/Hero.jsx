import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import useScrollReveal from '@/hooks/useScrollReveal'

const words = ['Skripsi', 'Tesis', 'Jurnal', 'Bisnis', 'AI Pintar']
const badges = [
  'AI Chat',
  'AI Writer',
  'Paraphrase AI',
  'Humanizer AI',
  'Transcribe AI',
  'Plagiarism Checker',
]

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const timeoutRef = useRef(null)

  const { ref: heroRef, isVisible } = useScrollReveal({ threshold: 0.1 })

  const particles = React.useMemo(() => {
    return [...Array(40)].map(() => ({
      width: Math.random() * 4 + 2 + 'px',
      height: Math.random() * 4 + 2 + 'px',
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animationDuration: Math.random() * 15 + 10 + 's',
      animationDelay: '-' + Math.random() * 15 + 's',
      opacity: Math.random() * 0.3 + 0.1,
    }))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Smooth typewriter effect
  useEffect(() => {
    const currentWord = words[wordIndex]

    if (!isDeleting) {
      // Typing
      if (displayText.length < currentWord.length) {
        timeoutRef.current = setTimeout(
          () => {
            setDisplayText(currentWord.substring(0, displayText.length + 1))
          },
          80 + Math.random() * 40,
        ) // slight randomness for natural feel
      } else {
        // Pause at the end before deleting
        timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200)
      }
    } else {
      // Deleting (faster)
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(
          () => {
            setDisplayText(currentWord.substring(0, displayText.length - 1))
          },
          35 + Math.random() * 20,
        )
      } else {
        setIsDeleting(false)
        setWordIndex((prev) => (prev + 1) % words.length)
      }
    }

    return () => clearTimeout(timeoutRef.current)
  }, [displayText, isDeleting, wordIndex])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden bg-gradient-to-br from-[#f0f4ff] via-[#e8eeff] to-[#f5f0ff] dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"
    >
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-float-particle {
          animation: float-particle ease-in-out infinite;
        }
        @keyframes blink-caret {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typing-cursor {
          animation: blink-caret 0.75s ease-in-out infinite;
        }
      `}</style>

      {/* Animated Gradient Orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4A90D9] rounded-full filter blur-[120px] opacity-[0.12] animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#a78bfa] rounded-full filter blur-[120px] opacity-[0.08] animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-[#6AB0F3] rounded-full filter blur-[120px] opacity-[0.1] animate-pulse"
        style={{ animationDuration: '6s', animationDelay: '2s' }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(74,144,217,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(74,144,217,0.3) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#4A90D9] animate-float-particle"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              opacity: p.opacity,
              animationDuration: p.animationDuration,
              animationDelay: p.animationDelay,
            }}
          />
        ))}
      </div>

      <div
        ref={heroRef}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center w-full"
      >
        {/* Badge pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {badges.map((badge, i) => (
            <span
              key={badge}
              className={`px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-[#4A90D9]/15 rounded-full shadow-sm hover:bg-white dark:hover:bg-gray-700 hover:border-[#4A90D9]/30 transition-all cursor-default ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <span className="mb-0.5 w-1.5 h-1.5 rounded-full bg-[#4A90D9] inline-block mr-2 shadow-[0_0_8px_rgba(74,144,217,0.5)] animate-pulse" />
              {badge}
            </span>
          ))}
        </div>

        {/* Headline with smooth typewriter */}
        <h1
          className={`text-[32px] leading-tight sm:text-5xl md:text-[64px] font-extrabold text-[#0a192f] dark:text-white md:leading-[1.2] tracking-tight mb-6 sm:mb-8 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s' }}
        >
          Sempurnakan Riset
          <br />
          Anda untuk
          <br />
          Kebutuhan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">
            {displayText}
            <span className="typing-cursor text-[#4A90D9] ml-0.5 font-black">|</span>
          </span>
        </h1>

        {/* Sub */}
        <p
          className={`text-[16px] md:text-[18px] text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s' }}
        >
          Temukan berbagai layanan yang sesuai dengan preferensi kamu bersama Pintaraja. Raih hasil
          maksimal dengan bimbingan dan AI tools terdepan.
        </p>

        {/* CTAs */}
        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transition: 'opacity 0.8s ease 0.7s, transform 0.8s ease 0.7s' }}
        >
          <a
            href="#layanan"
            className="group relative px-8 py-4 text-[15px] font-semibold text-[#0a192f] dark:text-white bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-full hover:bg-white dark:hover:bg-gray-700 hover:border-[#4A90D9]/30 hover:shadow-md transition-all min-w-[200px] overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Lihat Selengkapnya
            </span>
          </a>

          <Link
            to="/register"
            className="group relative px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full transition-all min-w-[200px] shadow-[0_0_20px_rgba(74,144,217,0.2)] hover:shadow-[0_0_30px_rgba(74,144,217,0.4)] overflow-hidden hover:scale-105"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              Mulai Sekarang trial
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100 flex flex-col items-center gap-2 animate-bounce'}`}
      >
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
          Scroll
        </span>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="text-gray-400 dark:text-gray-500"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
