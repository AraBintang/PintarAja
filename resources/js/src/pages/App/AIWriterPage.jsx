import React, { useState, useRef } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
    SelectLabel
} from '@/components/ui/select';
import { Zap, FileText, Ruler, BookOpen, Sparkles, Copy, Check, Download, RotateCcw, ChevronUp, ChevronDown, FileDown } from 'lucide-react';
import { LANGUAGES } from '../../data/languages';
import TiptapEditor from '../../components/TiptapEditor';

/* ─── AI Model Logo SVGs ─── */
const AutoIcon = () => (
    <Zap className="w-4 h-4 text-amber-500" />
);
const OpenAILogo = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.79a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.666zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
);
const GeminiLogo = () => (
    <img src="/google-gemini-icon.svg" alt="Gemini" className="w-4 h-4 object-contain" />
);
const ClaudeLogo = () => (
    <img src="/claude-ai-icon.svg" alt="Claude" className="w-4 h-4 object-contain" />
);
const DeepSeekLogo = () => (
    <img src="/deepseek-color.svg" alt="DeepSeek" className="w-4 h-4 object-contain" />
);

/* ─── Dropdown Options ─── */
const jenisKarya = ['Skripsi', 'Tesis', 'Disertasi', 'Jurnal Ilmiah', 'Esai Akademik', 'Artikel', 'Makalah', 'Laporan Penelitian'];
const bagianKarya = ['Abstrak', 'Pendahuluan', 'Tinjauan Pustaka', 'Metodologi', 'Hasil Penelitian', 'Pembahasan', 'Kesimpulan', 'Daftar Pustaka'];
const modelOptions = [
    { label: 'Auto', icon: <AutoIcon /> },
    { label: 'GPT-4o', icon: <OpenAILogo /> },
    { label: 'Gemini', icon: <GeminiLogo /> },
    { label: 'Claude', icon: <ClaudeLogo /> },
    { label: 'DeepSeek', icon: <DeepSeekLogo /> },
];
const jumlahHasil = ['1 Paragraf', '2 Paragraf', '3 Paragraf', '4 Paragraf', '5 Paragraf'];
const panjangMaks = ['500 kata', '1.000 kata', '1.500 kata', '2.000 kata', '3.000 kata'];

const promptLibrary = [
    'Tulis abstrak penelitian tentang dampak AI terhadap pendidikan tinggi di Indonesia.',
    'Buat tinjauan pustaka mengenai machine learning dalam analisis data kesehatan.',
    'Susun pendahuluan skripsi tentang pengaruh media sosial terhadap perilaku konsumen.',
    'Tulis metodologi penelitian kuantitatif dengan sampel 200 responden.',
    'Buat pembahasan hasil uji hipotesis menggunakan regresi linear berganda.',
    'Susun kesimpulan dan saran untuk penelitian tentang transformasi digital UMKM.',
];

const exampleCards = [
    {
        title: 'Dampak kecerdasan buatan dalam pendidikan tinggi',
        jenis: 'Skripsi',
        bagian: 'Pendahuluan',
        bahasa: 'Indonesian (Indonesia)',
        date: '03/03/2026',
    },
    {
        title: 'Machine learning for healthcare data analysis',
        jenis: 'Jurnal Ilmiah',
        bagian: 'Tinjauan Pustaka',
        bahasa: 'English (US)',
        date: '02/28/2026',
    },
    {
        title: 'Pengaruh media sosial terhadap perilaku konsumen milenial',
        jenis: 'Tesis',
        bagian: 'Metodologi',
        bahasa: 'Indonesian (Indonesia)',
        date: '02/25/2026',
    },
];

/* ─── Toolbar Select (for bottom toolbar) ─── */
function ToolbarSelect({ label, icon, options, value, onChange }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-[13px] text-gray-600 dark:text-gray-300 transition-all whitespace-nowrap"
            >
                {icon && <span className="flex items-center">{icon}</span>}
                <span className="text-gray-400 dark:text-gray-500 font-medium">{label}:</span>
                <span className="text-gray-800 dark:text-gray-200 font-semibold">{value}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 ml-1">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 min-w-[200px] py-1.5 max-h-60 overflow-y-auto">
                        {options.map((opt) => {
                            const optLabel = typeof opt === 'string' ? opt : opt.label;
                            const optIcon = typeof opt === 'object' ? opt.icon : null;
                            return (
                                <button
                                    key={optLabel}
                                    type="button"
                                    onClick={() => { onChange(optLabel); setOpen(false); }}
                                    className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${value === optLabel ? 'text-[#4A90D9] font-semibold' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    {optIcon && <span>{optIcon}</span>}
                                    {optLabel}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

/* ─── Prompt Library Modal ─── */
function PromptLibraryModal({ open, onClose, onSelect }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-[#4A90D9]" /> Prompt Library</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1">Pilih prompt yang sudah tersedia untuk mengisi topik penelitian Anda.</p>
                </div>
                <div className="p-3 max-h-[350px] overflow-y-auto space-y-1">
                    {promptLibrary.map((prompt, i) => (
                        <button
                            key={i}
                            onClick={() => { onSelect(prompt); onClose(); }}
                            className="w-full text-left p-4 rounded-xl text-[14px] text-gray-600 dark:text-gray-300 hover:bg-[#4A90D9]/5 hover:text-gray-800 dark:hover:text-white transition-all border border-transparent hover:border-[#4A90D9]/10"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={onClose} className="w-full py-2.5 text-[13px] font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Dummy generated HTML for demo ─── */
const DUMMY_GENERATED_HTML = `
<h1>Dampak Kecerdasan Buatan dalam Pendidikan Tinggi</h1>
<h2>1. Pendahuluan</h2>
<p>Perkembangan teknologi kecerdasan buatan (AI) telah membawa perubahan signifikan dalam berbagai sektor kehidupan, termasuk pendidikan tinggi. Transformasi digital yang dipercepat oleh pandemi global telah mendorong adopsi teknologi AI secara masif di institusi pendidikan di seluruh dunia.</p>
<p>Penelitian ini bertujuan untuk menganalisis dampak implementasi AI terhadap kualitas pembelajaran, efisiensi administratif, dan pengalaman mahasiswa di lingkungan perguruan tinggi Indonesia.</p>
<h2>2. Latar Belakang</h2>
<p>Kecerdasan buatan, dalam konteks pendidikan tinggi, mencakup berbagai aplikasi seperti:</p>
<ul>
<li><strong>Sistem pembelajaran adaptif</strong> yang menyesuaikan materi dengan kemampuan individu mahasiswa</li>
<li><strong>Chatbot akademik</strong> yang memberikan bantuan 24/7 kepada mahasiswa</li>
<li><strong>Analisis prediktif</strong> untuk mengidentifikasi mahasiswa yang berisiko gagal</li>
<li><strong>Otomatisasi penilaian</strong> yang meningkatkan efisiensi dosen</li>
</ul>
<blockquote>Menurut UNESCO (2024), lebih dari 60% institusi pendidikan tinggi di negara berkembang telah mengadopsi setidaknya satu bentuk teknologi AI dalam proses pembelajaran mereka.</blockquote>
<h2>3. Metodologi</h2>
<p>Penelitian ini menggunakan pendekatan <em>mixed-method</em> dengan kombinasi survei kuantitatif terhadap 500 mahasiswa dan wawancara mendalam dengan 20 dosen dari berbagai universitas di Indonesia. Data dikumpulkan selama periode Januari hingga Juni 2026.</p>
<h3>3.1 Populasi dan Sampel</h3>
<p>Populasi penelitian mencakup mahasiswa aktif program sarjana dan pascasarjana di 10 universitas terkemuka di Indonesia. Teknik sampling yang digunakan adalah <em>stratified random sampling</em> untuk memastikan representasi yang proporsional dari berbagai fakultas dan jenjang pendidikan.</p>
`;

/* ─── Main Page ─── */
export default function AIWriterPage() {
    const [topik, setTopik] = useState('');
    const [instruksi, setInstruksi] = useState('');
    const [jenis, setJenis] = useState('Skripsi');
    const [bagian, setBagian] = useState('Pendahuluan');
    const [bahasa, setBahasa] = useState('Indonesian (Indonesia)');
    const [model, setModel] = useState('Auto');
    const [jumlah, setJumlah] = useState('3 Paragraf');
    const [panjang, setPanjang] = useState('1.500 kata');
    const [promptOpen, setPromptOpen] = useState(false);

    // Editor state
    const [isGenerated, setIsGenerated] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [copied, setCopied] = useState(false);
    const [inputCollapsed, setInputCollapsed] = useState(false);
    const [downloadOpen, setDownloadOpen] = useState(false);
    const editorRef = useRef(null);

    const handleGenerate = () => {
        if (!topik.trim()) return;
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setEditorContent(DUMMY_GENERATED_HTML);
            setIsGenerated(true);
            setIsGenerating(false);
            setInputCollapsed(true);
        }, 2000);
    };

    const handleRegenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setEditorContent(DUMMY_GENERATED_HTML);
            setIsGenerating(false);
        }, 1500);
    };

    const handleReset = () => {
        setIsGenerated(false);
        setEditorContent('');
        setInputCollapsed(false);
    };

    const handleCopy = () => {
        const temp = document.createElement('div');
        temp.innerHTML = editorContent;
        navigator.clipboard.writeText(temp.textContent || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadDoc = () => {
        const fileName = topik.slice(0, 40) || 'ai-writer';
        const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"><title>${fileName}</title>
            <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;margin:2.54cm;}h1{font-size:16pt;font-weight:bold;}h2{font-size:14pt;font-weight:bold;}h3{font-size:12pt;font-weight:bold;}blockquote{border-left:3px solid #888;padding-left:12px;color:#555;font-style:italic;}</style>
            </head><body>${editorContent}</body></html>`;
        const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.doc`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadOpen(false);
    };

    const handleDownloadPdf = () => {
        const fileName = topik.slice(0, 40) || 'ai-writer';
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html><head><title>${fileName}</title>
            <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;margin:2.54cm;color:#1f2937;}h1{font-size:18pt;font-weight:bold;margin-bottom:8pt;}h2{font-size:15pt;font-weight:bold;margin-bottom:6pt;}h3{font-size:13pt;font-weight:bold;margin-bottom:4pt;}blockquote{border-left:3px solid #888;padding-left:12px;color:#555;font-style:italic;}ul{list-style:disc;padding-left:24pt;}ol{list-style:decimal;padding-left:24pt;}@media print{body{margin:0;}}</style>
            </head><body>${editorContent}</body></html>`);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
        setDownloadOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#f7f7f5] dark:bg-gray-900 flex flex-col items-center px-4 py-12 overflow-y-auto transition-colors duration-300">

            {/* Header */}
            <div className="text-center mb-10 max-w-2xl">
                <h1 className="text-3xl md:text-[42px] font-extrabold text-gray-800 dark:text-gray-100 tracking-tight leading-[1.2] mb-4">
                    AI Writer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed">
                    Buat karya tulis ilmiah berkualitas tinggi dengan bantuan AI. Pilih jenis karya, bahasa, dan model AI favorit Anda.
                </p>
            </div>

            {/* Main Form Card */}
            <div className="w-full max-w-3xl">

                {/* Collapsible Input Section */}
                {isGenerated && (
                    <button
                        type="button"
                        onClick={() => setInputCollapsed(!inputCollapsed)}
                        className="w-full flex items-center justify-between px-5 py-3 mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#4A90D9]" />
                            {inputCollapsed ? 'Tampilkan Input' : 'Sembunyikan Input'}
                        </span>
                        {inputCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                )}

                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${inputCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
                    {/* Topic Textarea */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden mb-4">
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Topik Penelitian</label>
                                <button
                                    type="button"
                                    onClick={() => setPromptOpen(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#4A90D9] bg-[#4A90D9]/10 border border-[#4A90D9]/20 rounded-lg hover:bg-[#4A90D9]/20 transition-colors"
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    Prompt Library
                                </button>
                            </div>
                            <textarea
                                value={topik}
                                onChange={(e) => setTopik(e.target.value)}
                                placeholder={'Masukkan topik penelitian dan kebutuhan Anda. Tambahkan konteks untuk hasil yang lebih berkualitas.\n\nContoh:\nTulis esai akademik tentang "Dampak Jangka Panjang Perubahan Iklim terhadap Ekosistem Laut."\nEsai harus menjelaskan bagaimana perubahan iklim mempengaruhi suhu laut, kenaikan permukaan air laut, dan keanekaragaman hayati laut dari waktu ke waktu.'}
                                rows={6}
                                className="w-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
                            />
                            <div className="flex items-center justify-end mt-2">
                                <span className="text-[12px] text-gray-400">{topik.length}/12,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Dropdowns Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        {/* Jenis Karya Tulis */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                            <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Jenis Karya Tulis</label>
                            <Select value={jenis} onValueChange={setJenis}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih jenis" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {jenisKarya.map((j) => (
                                            <SelectItem key={j} value={j}>{j}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bagian Karya */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                            <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Bagian Karya</label>
                            <Select value={bagian} onValueChange={setBagian}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih bagian" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {bagianKarya.map((b) => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Bahasa */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                            <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">Bahasa</label>
                            <Select value={bahasa} onValueChange={setBahasa}>
                                <SelectTrigger className="w-full focus:ring-1 focus:ring-blue-500">
                                    <SelectValue placeholder="Pilih bahasa">
                                        <div className="flex items-center gap-2">
                                            <span className={`${LANGUAGES.find(l => l.text === bahasa)?.img || 'fi fi-id'} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}></span>
                                            <span className="font-medium text-gray-700 dark:text-gray-200">{bahasa.split(' (')[0]}</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] rounded-xl dark:bg-gray-800 dark:border-gray-700">
                                    <SelectGroup>
                                        <SelectLabel>Bahasa</SelectLabel>
                                        {LANGUAGES.map(lang => (
                                            <SelectItem key={lang.text} value={lang.text} className="cursor-pointer py-2.5 px-3 hover:bg-blue-50 focus:bg-blue-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors rounded-lg mx-1 my-0.5">
                                                <div className="flex items-center gap-3">
                                                    <span className={`${lang.img} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}></span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-200">{lang.text.split(' (')[0]}</span>
                                                    <span className="text-gray-400 dark:text-gray-500 text-[11px] ml-auto hidden sm:inline-block">
                                                        {lang.text.includes('(') ? lang.text.split('(')[1].replace(')', '') : ''}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Additional Instructions */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                            Instruksi Tambahan <span className="text-gray-300 normal-case font-normal">(opsional)</span>
                        </label>
                        <textarea
                            value={instruksi}
                            onChange={(e) => setInstruksi(e.target.value)}
                            placeholder="Tambahkan instruksi khusus, misalnya gaya penulisan, referensi yang harus digunakan, dll."
                            rows={3}
                            className="w-full bg-transparent text-[14px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
                        />
                    </div>

                    {/* Bottom Toolbar */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <ToolbarSelect label="Model" icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />} options={modelOptions} value={model} onChange={setModel} />
                            <ToolbarSelect label="Jumlah" icon={<FileText className="w-3.5 h-3.5 text-blue-500" />} options={jumlahHasil} value={jumlah} onChange={setJumlah} />
                            <ToolbarSelect label="Maks" icon={<Ruler className="w-3.5 h-3.5 text-gray-500" />} options={panjangMaks} value={panjang} onChange={setPanjang} />
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topik.trim()}
                            className="relative group px-8 py-4 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-[15px] font-bold rounded-2xl shadow-[0_4px_20px_rgba(74,144,217,0.25)] hover:shadow-[0_4px_28px_rgba(74,144,217,0.4)] transition-all hover:scale-[1.02] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Menghasilkan...
                                    </>
                                ) : (
                                    <>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                        </svg>
                                        Generate Sekarang
                                    </>
                                )}
                            </span>
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[15px] font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-all hover:scale-[1.02] shadow-sm">
                            <span className="flex items-center justify-center gap-2">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
                                </svg>
                                Generate Bertahap
                            </span>
                        </button>
                    </div>
                </div>

                {/* ─── Tiptap Editor Output ─── */}
                {isGenerating && !isGenerated && (
                    <div className="mb-8">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">AI sedang menulis...</span>
                            </div>
                            <div className="p-8 flex flex-col items-center gap-4">
                                <div className="space-y-3 w-full animate-pulse">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3"></div>
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2 mt-6"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-4/5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isGenerated && (
                    <div className="mb-8">
                        {/* Editor Action Bar */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hasil</span>
                                <span className="text-[11px] font-medium text-[#4A90D9] bg-[#4A90D9]/10 px-2 py-0.5 rounded-md">{bagian}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Tersalin!' : 'Salin'}
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setDownloadOpen(!downloadOpen)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Unduh
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                    {downloadOpen && (
                                        <>
                                            <div className="fixed inset-0 z-30" onClick={() => setDownloadOpen(false)} />
                                            <div className="absolute top-full mt-1.5 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-40 min-w-[160px] py-1.5 overflow-hidden">
                                                <button
                                                    onClick={handleDownloadDoc}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                                                >
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    <div>
                                                        <span className="font-medium block">Word (.doc)</span>
                                                        <span className="text-[11px] text-gray-400">Dokumen Microsoft Word</span>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={handleDownloadPdf}
                                                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                                                >
                                                    <FileDown className="w-4 h-4 text-red-500" />
                                                    <div>
                                                        <span className="font-medium block">PDF (.pdf)</span>
                                                        <span className="text-[11px] text-gray-400">Print to PDF</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={handleRegenerate}
                                    disabled={isGenerating}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#4A90D9] bg-[#4A90D9]/10 border border-[#4A90D9]/20 rounded-lg hover:bg-[#4A90D9]/20 transition-colors disabled:opacity-50"
                                >
                                    <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                                    Regenerate
                                </button>
                            </div>
                        </div>

                        {/* Tiptap Editor */}
                        <TiptapEditor
                            content={editorContent}
                            onUpdate={setEditorContent}
                            placeholder="Hasil AI akan muncul di sini. Anda dapat mengedit langsung..."
                        />

                        {/* Word count & reset */}
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-[12px] text-gray-400 dark:text-gray-500">
                                {(() => {
                                    const temp = document.createElement('div');
                                    temp.innerHTML = editorContent;
                                    const text = temp.textContent || '';
                                    const words = text.trim().split(/\s+/).filter(Boolean).length;
                                    return `${words} kata`;
                                })()}
                            </span>
                            <button
                                onClick={handleReset}
                                className="text-[12px] font-medium text-gray-400 hover:text-red-500 transition-colors"
                            >
                                Reset Semua
                            </button>
                        </div>
                    </div>
                )}

                {/* Example Cards (only when no result) */}
                {!isGenerated && !isGenerating && (
                    <div>
                        <h3 className="text-[13px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Contoh Terbaru</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {exampleCards.map((card, i) => (
                                <button
                                    key={i}
                                    onClick={() => setTopik(card.title)}
                                    className="group text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 hover:border-[#4A90D9]/30 hover:shadow-md transition-all"
                                >
                                    <p className="text-[13px] text-gray-400 mb-1 flex items-center gap-1.5">
                                        <span className="text-[#4A90D9] font-bold text-[11px] bg-[#4A90D9]/10 px-2 py-0.5 rounded-md">Contoh</span>
                                    </p>
                                    <p className="text-[14px] text-gray-700 dark:text-gray-200 font-medium leading-snug mb-3 group-hover:text-gray-900 dark:group-hover:text-white transition-colors line-clamp-2">
                                        {card.title}
                                    </p>
                                    <p className="text-[12px] text-gray-400">
                                        {card.jenis} · {card.bagian} · {card.bahasa}
                                    </p>
                                    <p className="text-[11px] text-gray-300 mt-1">{card.date}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Prompt Library Modal */}
            <PromptLibraryModal
                open={promptOpen}
                onClose={() => setPromptOpen(false)}
                onSelect={(prompt) => setTopik(prompt)}
            />
        </div>
    );
}
