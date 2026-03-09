import React, { useState } from 'react';

const services = [
    {
        title: 'AI Chat',
        desc: 'Interaksi cerdas dengan asisten AI tercanggih untuk riset dan pengerjaan tugas Anda.',
        badge: 'POPULER',
    },
    {
        title: 'AI Writer',
        desc: 'Tulis draf karya ilmiah, esai, dan dokumen akademik dengan bantuan AI profesional.',
        badge: null,
    },
    {
        title: 'Humanizer AI',
        desc: 'Ubah teks hasil AI menjadi bahasa manusia yang alami dan bebas deteksi plagiarism.',
        badge: null,
    },
    {
        title: 'Parafrase AI',
        desc: 'Tingkatkan kualitas tulisan dengan struktur kalimat yang lebih baik dan profesional.',
        badge: null,
    },
    {
        title: 'Transcribe AI',
        desc: 'Ubah rekaman wawancara atau materi kuliah menjadi teks secara akurat dalam sekejap.',
        badge: null,
    },
];

export default function Services() {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="layanan" className="py-24 bg-[#f4f7fb] dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Left - Image */}
                    <div className="relative group perspective-1000 lg:sticky lg:top-24">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4A90D9] to-transparent opacity-10 rounded-3xl blur-xl transition-opacity duration-500 group-hover:opacity-20" />
                        <div className="relative rounded-3xl overflow-hidden border border-white shadow-2xl transform transition-transform duration-700 group-hover:rotate-x-2 group-hover:rotate-y-2">
                            <img
                                src="https://aiseo.ai/_next/image?url=%2Fhumanize_ai%2Fof1.webp&w=3840&q=75"
                                alt="AI Tools Dashboard"
                                className="w-full h-[420px] lg:h-[520px] object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/90 via-transparent to-transparent flex flex-col justify-end p-8">
                                <p className="text-white font-bold text-lg">AI Tools</p>
                                <p className="text-gray-200 text-sm">Solusi pintar untuk produktivitas Anda.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right - Service List */}
                    <div>
                        <span className="inline-block px-5 py-2 text-[13px] font-medium text-[#4A90D9] bg-white dark:bg-gray-800 border border-[#4A90D9]/20 shadow-sm rounded-full mb-6">
                            Produk dan Jasa
                        </span>
                        <h2 className="text-3xl md:text-[40px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-10 tracking-tight">
                            Layanan Berkualitas dari{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4A90D9] to-[#6AB0F3]">Pintaraja</span>
                        </h2>

                        <div className="space-y-4">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                        className="w-full flex items-center justify-between p-5 text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[17px] font-bold transition-colors ${openIndex === index ? 'text-[#4A90D9]' : 'text-[#1a2d4a] dark:text-gray-100 group-hover:text-[#4A90D9]'}`}>
                                                {service.title}
                                            </span>
                                            {service.badge && (
                                                <span className="px-3 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] rounded-full uppercase tracking-wider shadow-sm">
                                                    {service.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'border-[#4A90D9] bg-[#4A90D9]/10 rotate-180' : 'border-gray-200 dark:border-gray-700 bg-gray-50 group-hover:border-[#4A90D9]/50'}`}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={openIndex === index ? 'text-[#4A90D9]' : 'text-gray-400 group-hover:text-[#4A90D9]'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="p-5 pt-0 pr-12">
                                            <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-4">{service.desc}</p>
                                            <div className="flex gap-3">
                                                <a href="#" className="px-5 py-2 text-[13px] font-semibold text-[#4A90D9] bg-[#4A90D9]/10 rounded-full hover:bg-[#4A90D9]/20 transition-colors">
                                                    Lihat Selengkapnya
                                                </a>
                                                <a href="#kontak" className="px-5 py-2 text-[13px] font-semibold text-white bg-[#4A90D9] rounded-full hover:bg-[#3A7BC8] transition-colors shadow-sm hover:shadow-md">
                                                    Pesan Sekarang
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
