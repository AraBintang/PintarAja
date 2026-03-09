import React from 'react';

export default function AboutStats() {
    return (
        <section id="tentang-kami" className="py-32 bg-[#001a1a] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-[#00ffcc]/5 blur-[120px] rounded-full"></div>

            <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-20">
                <div className="flex-1 relative">
                    <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000"
                            alt="Team working"
                            className="w-full h-auto"
                        />
                    </div>
                    {/* Decorative absolute element */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-to-br from-[#008e8e] to-[#00ffcc] rounded-[2.5rem] -z-0 opacity-20 blur-2xl"></div>

                    <div className="absolute -bottom-6 -left-6 bg-[#003333] border border-white/10 p-8 rounded-3xl shadow-2xl z-20 backdrop-blur-xl">
                        <p className="text-4xl font-extrabold text-[#00ffcc] mb-1">98%</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Tingkat Kepuasan</p>
                    </div>
                </div>

                <div className="flex-1">
                    <h2 className="text-sm font-bold text-[#00ffcc] uppercase tracking-[0.3em] mb-4">Visi Kami</h2>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">Membangun Masa Depan Riset yang Terpersonalisasi</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-10">
                        Pintaraja didirikan dengan misi untuk menjembatani kesenjangan antara ambisi penelitian dan eksekusi teknis. Kami percaya bahwa setiap riset berhak mendapatkan dukungan terbaik untuk memberikan dampak yang nyata bagi dunia pendidikan dan bisnis.
                    </p>

                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-3xl font-bold text-white mb-2">300+</p>
                            <p className="text-sm text-slate-500 font-medium">Universitas Tercakup</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white mb-2">10k+</p>
                            <p className="text-sm text-slate-500 font-medium">Jam Konsultasi</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white mb-2">1,5k+</p>
                            <p className="text-sm text-slate-500 font-medium">Jurnal Terpublikasi</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-[#00ffcc] mb-2 flex items-center gap-2">
                                4.9
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#00ffcc" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                            </p>
                            <p className="text-sm text-slate-500 font-medium">Google Review</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
