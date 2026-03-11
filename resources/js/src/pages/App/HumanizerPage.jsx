// import React from 'react';
// import { Link } from 'react-router-dom';

// export default function HumanizerPage() {
// ... coming soon code kept omitted for brevity but keeping structure ...
// }

import React, { useState, useRef } from 'react';
import { Copy, RotateCcw, Upload, Check } from 'lucide-react';
import mammoth from 'mammoth';
import { LANGUAGES } from '../../data/languages';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AssistantIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

/* ─── Sample Text ─── */
const sampleText = `Kecerdasan buatan (AI) telah menjadi salah satu teknologi paling transformatif di era modern. Dengan kemampuannya untuk memproses data dalam skala besar, AI memungkinkan otomatisasi berbagai tugas yang sebelumnya memerlukan campur tangan manusia. Dalam konteks pendidikan, AI telah merevolusi cara mahasiswa belajar dan menyelesaikan tugas akademik mereka.

Penerapan AI dalam penulisan akademik memberikan keuntungan signifikan, termasuk peningkatan efisiensi dan kualitas konten yang dihasilkan. Namun, tantangan etika dan keaslian tetap menjadi perhatian utama di kalangan akademisi.`;

export default function HumanizerPage() {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [selectedLang, setSelectedLang] = useState('Indonesian (Indonesia)');
    const [mode, setMode] = useState('Basic');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const fileInputRef = useRef(null);

    const modes = ['Basic', 'Advanced'];

    const countWords = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

    const handleInputText = (e) => {
        const text = e.target.value;
        const words = countWords(text);

        if (words <= 250) {
            setInputText(text);
        } else if (text.length < inputText.length) {
            setInputText(text);
        } else {
            const cut = text.trim().split(/\s+/).slice(0, 250).join(' ');
            setInputText(cut + (text.endsWith(' ') ? ' ' : ''));
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileType = file.name.split('.').pop().toLowerCase();

        if (fileType === 'txt') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const words = text.split(/\s+/).filter(Boolean);
                setInputText(words.length > 250 ? words.slice(0, 250).join(' ') : text);
            }
            reader.readAsText(file);
        } else if (fileType === 'docx') {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const words = result.value.split(/\s+/).filter(Boolean);
                    setInputText(words.length > 250 ? words.slice(0, 250).join(' ') : result.value);
                } catch (error) {
                    console.error("Error parsing docx:", error);
                    alert("Gagal membaca file Word.");
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('Format file tidak didukung. Harap upload .txt atau .docx');
        }
        event.target.value = '';
    };

    const handleHumanize = () => {
        if (!inputText.trim()) return;
        setIsProcessing(true);
        setTimeout(() => {
            setOutputText(inputText
                .replace(/telah menjadi/g, 'kini menjadi')
                .replace(/memungkinkan/g, 'membuka jalan untuk')
                .replace(/Penerapan/g, 'Penggunaan')
                .replace(/memberikan/g, 'menghadirkan')
                .replace(/signifikan/g, 'yang cukup berarti')
                .replace(/Namun/g, 'Meski demikian')
            );
            setIsProcessing(false);
        }, 1500);
    };

    const handleTrySample = () => {
        setInputText(sampleText);
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const words = text.split(/\s+/).filter(Boolean);
            setInputText(words.length > 250 ? words.slice(0, 250).join(' ') : text);
        } catch {
            // Fallback
        }
    };

    const handleCopy = () => {
        if (outputText) {
            navigator.clipboard.writeText(outputText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-gray-900 overflow-y-auto overflow-x-hidden pt-0 pb-10 px-6 max-w-full">
            <div className="max-w-[1200px] mx-auto w-full mb-6 mt-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <AssistantIcon className="w-6 h-6 text-orange-500" />
                    Humanizer AI
                </h1>
                <p className="text-gray-500 text-sm mt-1">Ubah teks tulisan AI menjadi lebih natural dan terlihat ditulis oleh manusia.</p>
            </div>

            <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col bg-white dark:bg-[#1e2330] rounded-xl border border-gray-200 dark:border-gray-800 overflow-visible min-h-[600px] mb-20 md:mb-8 shadow-sm">
                {/* Top Bar - Languages + Modes */}
                <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto overflow-visible">

                        {/* Mode Tabs */}
                        <div className="flex flex-wrap md:items-center gap-1.5 md:gap-2 w-full lg:w-auto pl-1 pt-1">
                            <span className="font-semibold text-slate-800 dark:text-gray-200 text-[15px] mr-1">Modes:</span>
                            {modes.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    className={`px-3 py-2 text-[14px] font-medium rounded-[10px] transition-all duration-200 ${mode === m
                                        ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>

                    </div>
                    {/* Language Dropdown */}
                    <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 z-40">
                        <Select value={selectedLang} onValueChange={setSelectedLang}>
                            <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-[#252b3b] border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-orange-500 text-[14px] shadow-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a3142] transition-colors">
                                <SelectValue placeholder="Pilih Bahasa">
                                    <div className="flex items-center gap-2">
                                        <span className={`${LANGUAGES.find(l => l.text === selectedLang)?.img || 'fi fi-id'} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}></span>
                                        <span className="font-medium text-gray-700 dark:text-gray-200">{selectedLang.split(' (')[0]}</span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[350px] z-50 rounded-xl shadow-xl dark:bg-[#1e2330] dark:border-gray-700">
                                <SelectGroup>
                                    <SelectLabel>Bahasa</SelectLabel>
                                    {LANGUAGES.map(lang => (
                                        <SelectItem key={lang.text} value={lang.text} className="cursor-pointer py-2.5 px-3 hover:bg-orange-50 focus:bg-orange-50 dark:hover:bg-[#252b3b] dark:focus:bg-[#252b3b] transition-colors rounded-lg mx-1 my-0.5">
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

                {/* Split Panels */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 border-t border-gray-100 dark:border-gray-800">
                    {/* Left Panel - Input */}
                    <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-transparent">
                        <div className="flex-1 p-6 relative">
                            <textarea
                                value={inputText}
                                onChange={handleInputText}
                                placeholder="Masukkan atau tempel teks Anda di sini dan klik Humanize untuk mengubah teks AI."
                                className="w-full h-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed min-h-[250px] md:min-h-0"
                            />

                            {/* Quick Action Buttons - shown when empty */}
                            {!inputText && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        onClick={handleTrySample}
                                        className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
                                    >
                                        <AssistantIcon className="w-4 h-4" />
                                        Try Sample Text
                                    </button>
                                    <button
                                        onClick={handlePaste}
                                        className="flex !hidden md:!flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Paste Text
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Word count */}
                        <div className="px-6 py-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between dark:bg-transparent">
                            <span className={`text-[12px] ${countWords(inputText) >= 250 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                                {countWords(inputText)} / 250 kata
                            </span>
                            {inputText && (
                                <button
                                    onClick={() => setInputText('')}
                                    className="text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-[#1b1f2b]">
                        <div className="flex-1 p-6 overflow-y-auto">
                            {isProcessing ? (
                                <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Humanizing text...</span>
                                    </div>
                                </div>
                            ) : outputText ? (
                                <div className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                                    {outputText}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
                                    <p className="text-[14px] text-gray-400 text-center max-w-xs leading-relaxed">
                                        Hasil teks yang telah di-humanize akan muncul di sini
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Output footer */}
                        {outputText && (
                            <div className="px-6 py-3 flex items-center justify-between bg-white dark:bg-transparent text-gray-500 dark:text-gray-400">
                                <span className="text-[12px]">
                                    {countWords(outputText)} kata
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="text-[12px] text-orange-600 hover:text-orange-700 font-medium transition-colors flex items-center gap-1.5"
                                >
                                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {isCopied ? 'Tersalin' : 'Copy Result'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar - Desktop */}
                <div className="hidden md:flex bg-white dark:bg-transparent border-t border-gray-100 dark:border-gray-800 px-6 py-4 flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".txt,.docx"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-[14px] font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-center"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Doc
                    </button>

                    <button
                        onClick={handleHumanize}
                        disabled={!inputText.trim() || isProcessing || countWords(inputText) > 250}
                        className={`px-10 py-3 text-[14px] font-bold rounded-full transition-all w-full sm:w-auto ${inputText.trim() && !isProcessing && countWords(inputText) <= 250
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Humanize Text'}
                    </button>

                    {/* Desktop spacer to keep the button exactly centered relative to the whole bar if needed */}
                    <div className="hidden sm:block w-[130px]"></div>
                </div>
            </div>

            {/* Mobile Action Bar - Sticky */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-5 z-[30] transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[14px] font-bold text-orange-500">{mode}</span>
                        <div className="flex items-center gap-3">
                            <button onClick={handleCopy} className={`p-2 transition-colors ${isCopied ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={handleHumanize}
                        disabled={!inputText.trim() || isProcessing || countWords(inputText) > 250}
                        className={`w-full py-3 text-[15px] font-bold rounded-full transition-all ${inputText.trim() && !isProcessing && countWords(inputText) <= 250
                            ? 'bg-orange-500 text-white active:scale-95'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        {isProcessing ? 'Processing...' : 'Humanize'}
                    </button>
                </div>
            </div>
        </div>
    );
}
