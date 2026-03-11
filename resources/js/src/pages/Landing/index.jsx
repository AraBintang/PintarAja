import About from './components/About'
import CTA from './components/CTA'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import GipsyAI from './components/GipsyAI'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Pricing from './components/Pricing'
import Services from './components/Services'
import StatsAdvantages from './components/StatsAdvantages'
import Testimonials from './components/Testimonials'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar />
      <Hero />
      <Services />
      <Pricing />
      <About />
      <StatsAdvantages />
      <Testimonials />
      <GipsyAI />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
