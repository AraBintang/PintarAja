import React, { Suspense } from 'react'

import Hero from './components/Hero'
import Navbar from './components/Navbar'

const About = React.lazy(() => import('./components/About'))
const CTA = React.lazy(() => import('./components/CTA'))
const FAQ = React.lazy(() => import('./components/FAQ'))
const Footer = React.lazy(() => import('./components/Footer'))
const GipsyAI = React.lazy(() => import('./components/GipsyAI'))
const Pricing = React.lazy(() => import('./components/Pricing'))
const Services = React.lazy(() => import('./components/Services'))
const StatsAdvantages = React.lazy(() => import('./components/StatsAdvantages'))
const Testimonials = React.lazy(() => import('./components/Testimonials'))
const Youtube = React.lazy(() => import('./components/Youtube'))

// Loader placeholder for Suspense
const SectionLoader = () => (
  <div className="w-full h-[400px] flex items-center justify-center bg-[#f4f7fb]/50 dark:bg-gray-900/50">
    <div className="w-8 h-8 rounded-full border-2 border-[#4A90D9] border-t-transparent animate-spin" />
  </div>
)

/**
 * Smooth curved wave divider between sections.
 * Uses a natural-looking multi-curve path for a flowing organic feel.
 */
function WaveDivider({ from = 'light', to = 'dark', flip = false }) {
  const bgClass = {
    light: 'bg-[#f4f7fb] dark:bg-gray-900',
    dark: 'bg-white dark:bg-gray-900',
    accent: 'bg-[#f0f4ff] dark:bg-gray-900',
  }
  const fillClass = {
    light: 'fill-[#f4f7fb] dark:fill-gray-900',
    dark: 'fill-white dark:fill-gray-900',
    accent: 'fill-[#f0f4ff] dark:fill-gray-900',
  }

  return (
    <div
      className={`relative w-full overflow-hidden leading-[0] ${bgClass[from] || bgClass.dark}`}
      style={{
        marginTop: '-1px',
        marginBottom: '-1px',
        transform: flip ? 'rotate(180deg)' : undefined,
      }}
    >
      <svg
        className="relative block w-full"
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ height: '80px', width: 'calc(100% + 1.3px)' }}
      >
        <path
          d="M0,40 C240,100 480,0 720,60 C960,120 1200,20 1440,80 L1440,120 L0,120 Z"
          className={fillClass[to] || fillClass.dark}
        />
      </svg>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Hero />

      <Suspense fallback={<SectionLoader />}>
        <WaveDivider from="accent" to="light" />
        <Services />

        <WaveDivider from="light" to="dark" />
        <Pricing />

        <WaveDivider from="dark" to="light" />
        <About />

        <WaveDivider from="light" to="dark" />
        <StatsAdvantages />

        <WaveDivider from="dark" to="light" />
        <Testimonials />

        <WaveDivider from="light" to="dark" />
        <GipsyAI />

        <WaveDivider from="dark" to="light" />
        <FAQ />

        <WaveDivider from="light" to="dark" />
        <Youtube />

        <WaveDivider from="dark" to="accent" />
        <CTA />

        <Footer />
      </Suspense>
    </div>
  )
}
