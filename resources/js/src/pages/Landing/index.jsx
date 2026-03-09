import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import Pricing from './components/Pricing';
import About from './components/About';
import StatsAdvantages from './components/StatsAdvantages';
import Testimonials from './components/Testimonials';
import GipsyAI from './components/GipsyAI';
import FAQ from './components/FAQ';
import CTA from './components/CTA';
import Footer from './components/Footer';

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
    );
}
