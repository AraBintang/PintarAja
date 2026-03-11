import { Link } from 'react-router-dom'

export default function HumanizerPage() {
  return (
    <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#0f141e] p-6 md:p-12 relative overflow-hidden transition-colors duration-300">
      {/* Background Grid & Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Dotted Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] text-gray-900 dark:text-white"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none transition-colors duration-300" />

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 rounded-full bg-orange-500/40 animate-blob" />
        <div
          className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-amber-500/40 animate-float"
          style={{ animationDelay: '-2s' }}
        />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 rounded-full bg-orange-600/60 animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/3 w-5 h-5 rounded-full bg-yellow-500/30 animate-blob"
          style={{ animationDelay: '-4s' }}
        />
        <div
          className="absolute top-10 right-10 w-24 h-24 rounded-full border border-orange-500/20 animate-float"
          style={{ animationDelay: '-1s' }}
        />
        <div
          className="absolute bottom-10 left-10 w-32 h-32 rounded-full border border-orange-500/20 animate-float"
          style={{ animationDelay: '-3s' }}
        />
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 z-10 max-w-6xl mx-auto w-full relative">
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left animate-in fade-in slide-in-from-left duration-700">
          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-yellow-400 transition-colors duration-300 pb-2">
            Coming
            <br />
            Soon!
          </h1>
          <p className="text-xl md:text-2xl font-medium mb-8 text-gray-600 dark:text-gray-400 max-w-md mx-auto md:mx-0 transition-colors duration-300">
            Halaman ini masih dalam tahap pengembangan. Fitur unggulan kami akan segera hadir!
          </p>
          <Link
            to="/chat"
            className="inline-block px-10 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-sm tracking-wider uppercase shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            Go to AI Chat
          </Link>
        </div>

        {/* Illustration */}
        <div className="flex-1 relative animate-in fade-in slide-in-from-right duration-700 max-w-md mx-auto">
          <div className="relative z-10 drop-shadow-2xl dark:drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] animate-float">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="240"
              width="240"
              viewBox="0 0 640 640"
              fill="currentColor"
            >
              <path d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

//
// import { Copy, RotateCcw, Upload, ChevronDown, UserCheck, Languages, MoreVertical } from 'lucide-react';
// import mammoth from 'mammoth';
// import { NavLink } from 'react-router-dom';

// const AssistantIcon = ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
//     </svg>
// );
// import {
//     Select,
//     SelectContent,
//     SelectGroup,
//     SelectItem,
//     SelectLabel,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// /* ─── Languages ─── */
// const languages = ['Indonesia', 'English', 'French', 'Spanish', 'German'];

// /* ─── Sample Text ─── */
// const sampleText = `Kecerdasan buatan (AI) telah menjadi salah satu teknologi paling transformatif di era modern. Dengan kemampuannya untuk memproses data dalam skala besar, AI memungkinkan otomatisasi berbagai tugas yang sebelumnya memerlukan campur tangan manusia. Dalam konteks pendidikan, AI telah merevolusi cara mahasiswa belajar dan menyelesaikan tugas akademik mereka.

// Penerapan AI dalam penulisan akademik memberikan keuntungan signifikan, termasuk peningkatan efisiensi dan kualitas konten yang dihasilkan. Namun, tantangan etika dan keaslian tetap menjadi perhatian utama di kalangan akademisi.`;

// export default function HumanizerPage() {
//     const [inputText, setInputText] = useState('');
//     const [outputText, setOutputText] = useState('');
//     const [selectedLang, setSelectedLang] = useState('Indonesia');
//     const [mode, setMode] = useState('Basic');
//     const [isProcessing, setIsProcessing] = useState(false);
//     const fileInputRef = useRef(null);

//     const handleFileUpload = async (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         const fileType = file.name.split('.').pop().toLowerCase();

//         if (fileType === 'txt') {
//             const reader = new FileReader();
//             reader.onload = (e) => setInputText(e.target.result);
//             reader.readAsText(file);
//         } else if (fileType === 'docx') {
//             const reader = new FileReader();
//             reader.onload = async (e) => {
//                 const arrayBuffer = e.target.result;
//                 try {
//                     const result = await mammoth.extractRawText({ arrayBuffer });
//                     setInputText(result.value);
//                 } catch (error) {
//                     console.error("Error parsing docx:", error);
//                     alert("Gagal membaca file Word.");
//                 }
//             };
//             reader.readAsArrayBuffer(file);
//         } else {
//             alert('Format file tidak didukung. Harap upload .txt atau .docx');
//         }

//         // Reset input value to allow uploading same file again
//         event.target.value = '';
//     };

//     const handleHumanize = () => {
//         if (!inputText.trim()) return;
//         setIsProcessing(true);
//         // Simulate processing
//         setTimeout(() => {
//             setOutputText(inputText
//                 .replace(/telah menjadi/g, 'kini menjadi')
//                 .replace(/memungkinkan/g, 'membuka jalan untuk')
//                 .replace(/Penerapan/g, 'Penggunaan')
//                 .replace(/memberikan/g, 'menghadirkan')
//                 .replace(/signifikan/g, 'yang cukup berarti')
//                 .replace(/Namun/g, 'Meski demikian')
//             );
//             setIsProcessing(false);
//         }, 1500);
//     };

//     const handleTrySample = () => {
//         setInputText(sampleText);
//     };

//     const handlePaste = async () => {
//         try {
//             const text = await navigator.clipboard.readText();
//             setInputText(text);
//         } catch {
//             // Fallback: just focus the textarea
//         }
//     };

//     const handleCopy = () => {
//         if (outputText) navigator.clipboard.writeText(outputText);
//     };

//     return (
//         <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto overflow-x-hidden pt-0 pb-10">
//             <div className="max-w-[1200px] mx-auto w-full mb-6 mt-6 px-6 md:px-8">
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
//                     <AssistantIcon className="w-6 h-6 text-orange-500" />
//                     Humanizer AI
//                 </h1>
//                 <p className="text-gray-500 text-sm mt-1">Ubah teks tulisan AI menjadi lebih natural dan terlihat ditulis oleh manusia.</p>
//             </div>

//             <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-[16px] shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[600px] mb-20 md:mb-8 mx-6 md:mx-auto">
//                 {/* Top Bar - Languages + Modes */}
//                 <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-4">
//                     <div className="flex items-center justify-between md:justify-start gap-4">

//                         <button className="md:hidden p-2 text-gray-500">
//                             <MoreVertical className="w-5 h-5" />
//                         </button>
//                     </div>
//                     {/* Language Dropdown */}
//                     <Select value={selectedLang} onValueChange={setSelectedLang}>
//                         <SelectTrigger className="w-[180px] h-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700 focus:ring-0">
//                             <SelectValue placeholder="Pilih Bahasa" />
//                         </SelectTrigger>
//                         <SelectContent>
//                             <SelectGroup>
//                                 <SelectLabel>Bahasa</SelectLabel>
//                                 {languages.map(lang => (
//                                     <SelectItem key={lang} value={lang}>{lang}</SelectItem>
//                                 ))}
//                             </SelectGroup>
//                         </SelectContent>
//                     </Select>

//                     {/* Mode Tabs */}
//                     <div className="flex items-center mx-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
//                         {['Basic', 'Advanced'].map((m) => (
//                             <button
//                                 key={m}
//                                 onClick={() => setMode(m)}
//                                 className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${mode === m
//                                     ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'
//                                     : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border border-transparent'
//                                     }`}
//                             >
//                                 {m}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Split Panels */}
//                 <div className="flex-1 flex flex-col md:flex-row min-h-0">
//                     {/* Left Panel - Input */}
//                     <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
//                         <div className="flex-1 p-6 relative">
//                             <textarea
//                                 value={inputText}
//                                 onChange={(e) => setInputText(e.target.value)}
//                                 placeholder="Masukkan atau tempel teks Anda di sini dan klik Humanize untuk mengubah teks AI."
//                                 className="w-full h-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed min-h-[250px] md:min-h-0"
//                             />

//                             {/* Quick Action Buttons - shown when empty */}
//                             {!inputText && (
//                                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
//                                     <button
//                                         onClick={handleTrySample}
//                                         className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
//                                     >
//                                         <AssistantIcon className="w-4 h-4" />
//                                         Try Sample Text
//                                     </button>
//                                     <button
//                                         onClick={handlePaste}
//                                         className="flex !hidden md:!flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
//                                     >
//                                         <Copy className="w-4 h-4" />
//                                         Paste Text
//                                     </button>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Word count */}
//                         <div className="px-6 py-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-700/50">
//                             <span className="text-[12px] text-gray-400">
//                                 {inputText ? inputText.split(/\s+/).filter(Boolean).length : 0} kata
//                             </span>
//                             {inputText && (
//                                 <button
//                                     onClick={() => setInputText('')}
//                                     className="text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
//                                 >
//                                     <RotateCcw className="w-3.5 h-3.5" />
//                                     Clear
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Right Panel - Output */}
//                     <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-700/30">
//                         <div className="flex-1 p-6 overflow-y-auto">
//                             {isProcessing ? (
//                                 <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
//                                     <div className="flex flex-col items-center gap-3">
//                                         <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
//                                         <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">Humanizing text...</span>
//                                     </div>
//                                 </div>
//                             ) : outputText ? (
//                                 <div className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
//                                     {outputText}
//                                 </div>
//                             ) : (
//                                 <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
//                                     <p className="text-[14px] text-gray-400 text-center max-w-xs leading-relaxed">
//                                         Hasil teks yang telah di-humanize akan muncul di sini
//                                     </p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Output footer */}
//                         {outputText && (
//                             <div className="px-6 py-3 border-t border-gray-50 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
//                                 <span className="text-[12px]">
//                                     {outputText.split(/\s+/).filter(Boolean).length} kata
//                                 </span>
//                                 <button
//                                     onClick={handleCopy}
//                                     className="text-[12px] text-orange-600 hover:text-orange-700 font-medium transition-colors flex items-center gap-1.5"
//                                 >
//                                     <Copy className="w-3.5 h-3.5" />
//                                     Copy Result
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Bottom Bar - Desktop */}
//                 <div className="hidden md:flex bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
//                     <input
//                         type="file"
//                         ref={fileInputRef}
//                         onChange={handleFileUpload}
//                         accept=".txt,.docx"
//                         className="hidden"
//                     />
//                     <button
//                         onClick={() => fileInputRef.current?.click()}
//                         className="flex items-center gap-2 text-[14px] font-medium text-gray-600 hover:text-gray-800 transition-colors px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:bg-gray-700 border border-transparent hover:border-gray-200 dark:border-gray-700 w-full sm:w-auto justify-center"
//                     >
//                         <Upload className="w-4 h-4" />
//                         Upload Doc
//                     </button>

//                     <button
//                         onClick={handleHumanize}
//                         disabled={!inputText.trim() || isProcessing}
//                         className={`px-10 py-3 text-[14px] font-bold rounded-full transition-all w-full sm:w-auto ${inputText.trim() && !isProcessing
//                             ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
//                             }`}
//                     >
//                         {isProcessing ? 'Processing...' : 'Humanize Text'}
//                     </button>

//                     {/* Desktop spacer to keep the button exactly centered relative to the whole bar if needed, otherwise flex-between spaces it out pretty well. But in original design it was center. Let's make it nicely balanced. */}
//                     <div className="hidden sm:block w-[130px]"></div>
//                 </div>
//             </div>

//             {/* Mobile Action Bar - Sticky */}
//             <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-3 z-[30] transition-all duration-300">
//                 <div className="flex flex-col gap-2">
//                     <div className="flex items-center justify-between px-2">
//                         <span className="text-[14px] font-bold text-orange-500">{mode}</span>
//                         <div className="flex items-center gap-3">
//                             <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
//                                 <Copy className="w-5 h-5" />
//                             </button>
//                         </div>
//                     </div>
//                     <button
//                         onClick={handleHumanize}
//                         disabled={!inputText.trim() || isProcessing}
//                         className={`w-full py-3 text-[15px] font-bold rounded-full transition-all ${inputText.trim() && !isProcessing
//                             ? 'bg-orange-500 text-white active:scale-95'
//                             : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
//                             }`}
//                     >
//                         {isProcessing ? 'Processing...' : 'Humanize'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
