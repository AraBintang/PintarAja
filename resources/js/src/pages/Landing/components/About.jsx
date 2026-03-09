import React from 'react';

export default function About() {
    return (
        <section id="tentang" className="relative py-24 bg-[#f4f7fb] dark:bg-gray-900 overflow-hidden">
            {/* Soft background accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4A90D9] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#6AB0F3] opacity-[0.03] rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 text-center">
                <span className="inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-8">
                    Tentang Pintaraja
                </span>
                <h2 className="text-3xl md:text-[44px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6 max-w-4xl mx-auto tracking-tight">
                    Platform AI untuk{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">Produktivitas Mahasiswa</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-[18px] leading-relaxed max-w-3xl mx-auto mb-10">
                    Pintaraja adalah platform berbasis AI yang membantu mahasiswa dalam membuat konten, mengembangkan ide, mengerjakan skripsi, hingga merangkum jurnal. Dengan terintegrasi berbagai model AI seperti OpenAI, Gemini, Claude, dan lainnya — semua kebutuhan akademik Anda ada di satu tempat.
                </p>
                <a
                    href="#"
                    className="inline-flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full hover:shadow-[0_4px_16px_rgba(74,144,217,0.3)] hover:-translate-y-0.5 transition-all mb-16"
                >
                    Pelajari Selengkapnya
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>

                {/* Team Photo */}
                <div className="relative max-w-5xl mx-auto rounded-[2rem] p-2 bg-gradient-to-b from-white/60 dark:from-gray-800/60 to-transparent backdrop-blur-sm border border-white/50 dark:border-gray-700 shadow-2xl group">
                    <div className="absolute inset-x-8 -bottom-8 h-8 bg-gradient-to-b from-black/5 to-transparent blur-xl pointer-events-none"></div>
                    <div className="relative rounded-[1.5rem] overflow-hidden shadow-inner">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
                            alt="Tim Pintaraja"
                            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 border border-white/20 rounded-[1.5rem] pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}

