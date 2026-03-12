import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileDown,
  FileText,
  RotateCcw,
  Ruler,
  Sparkles,
  Zap,
  Loader2,
  FolderPlus,
} from 'lucide-react'
import React, { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import TiptapEditor from '../../components/TiptapEditor'
import { LANGUAGES } from '../../data/languages'

/* ─── AI Model Logo SVGs ─── */
const AutoIcon = () => <Zap className="w-4 h-4 text-amber-500" />
const OpenAILogo = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.79a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.666zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
  </svg>
)
const GeminiLogo = () => (
  <img src="/google-gemini-icon.svg" alt="Gemini" className="w-4 h-4 object-contain" />
)
const ClaudeLogo = () => (
  <img src="/claude-ai-icon.svg" alt="Claude" className="w-4 h-4 object-contain" />
)
const DeepSeekLogo = () => (
  <img src="/deepseek-ai-icon.svg" alt="DeepSeek" className="w-4 h-4 object-contain" />
)

/* ─── Dropdown Options ─── */
const jenisKarya = [
  'Skripsi',
  'Tesis',
  'Disertasi',
  'Jurnal Ilmiah',
  'Esai Akademik',
  'Artikel',
  'Makalah',
  'Laporan Penelitian',
]
const bagianKarya = [
  'Abstrak',
  'Pendahuluan',
  'Tinjauan Pustaka',
  'Metodologi',
  'Hasil Penelitian',
  'Pembahasan',
  'Kesimpulan',
  'Daftar Pustaka',
]
const modelOptions = [
  { label: 'Auto', icon: <AutoIcon /> },
  { label: 'GPT-4o', icon: <OpenAILogo /> },
  { label: 'Gemini', icon: <GeminiLogo /> },
  { label: 'Claude', icon: <ClaudeLogo /> },
  { label: 'DeepSeek', icon: <DeepSeekLogo /> },
]
const jumlahHasil = ['1 Paragraf', '2 Paragraf', '3 Paragraf', '4 Paragraf', '5 Paragraf']
const panjangMaks = ['500 kata', '1.000 kata', '1.500 kata', '2.000 kata', '3.000 kata']

// Dummy Workbooks
const dummyWorkbooks = [
  { id: '1', name: 'Tesis Akhir' },
  { id: '2', name: 'Proposal Penelitian' },
  { id: '3', name: 'Artikel Publikasi' },
  { id: '4', name: 'Draft Skripsi' },
]

const promptLibrary = [
  'Tulis abstrak penelitian tentang dampak AI terhadap pendidikan tinggi di Indonesia.',
  'Buat tinjauan pustaka mengenai machine learning dalam analisis data kesehatan.',
  'Susun pendahuluan skripsi tentang pengaruh media sosial terhadap perilaku konsumen.',
  'Tulis metodologi penelitian kuantitatif dengan sampel 200 responden.',
  'Buat pembahasan hasil uji hipotesis menggunakan regresi linear berganda.',
  'Susun kesimpulan dan saran untuk penelitian tentang transformasi digital UMKM.',
]

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
]

/* ─── Toolbar Select (for bottom toolbar) ─── */
function ToolbarSelect({ label, icon, options, value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="flex h-auto outline-none focus:ring-0 items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all whitespace-nowrap [&>svg]:opacity-50 min-w-max">
        <SelectValue>
          <div className="flex items-center gap-2 mr-1">
            {icon && <span className="flex items-center">{icon}</span>}
            <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
              {label}:
            </span>
            <span className="text-[13px] text-gray-800 dark:text-gray-200 font-semibold">
              {value}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        className="z-50 rounded-xl min-w-[200px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
        position="popper"
        side="top"
        sideOffset={8}
      >
        <SelectGroup>
          {options.map((opt) => {
            const optLabel = typeof opt === 'string' ? opt : opt.label
            const optIcon = typeof opt === 'object' ? opt.icon : null
            return (
              <SelectItem
                key={optLabel}
                value={optLabel}
                className="cursor-pointer py-2.5 pl-8 pr-3 hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors rounded-lg mx-1 my-0.5"
              >
                <div className="flex items-center gap-2 text-[13px]">
                  {optIcon && <span>{optIcon}</span>}
                  <span
                    className={
                      value === optLabel
                        ? 'text-[#4A90D9] font-semibold'
                        : 'text-gray-600 dark:text-gray-300'
                    }
                  >
                    {optLabel}
                  </span>
                </div>
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

/* ─── Prompt Library Modal ─── */
function PromptLibraryModal({ open, onClose, onSelect }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A90D9]" /> Prompt Library
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1">
            Pilih prompt yang sudah tersedia untuk mengisi topik penelitian Anda.
          </p>
        </div>
        <div className="p-3 max-h-[350px] overflow-y-auto space-y-1">
          {promptLibrary.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(prompt)
                onClose()
              }}
              className="w-full text-left p-4 rounded-xl text-[14px] text-gray-600 dark:text-gray-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-[13px] font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Save Workbook Modal ─── */
function SaveWorkbookModal({ open, onClose, defaultName, onSave }) {
  const [fileName, setFileName] = useState(defaultName || '')
  const [workbookId, setWorkbookId] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setFileName(defaultName || '')
      setWorkbookId('')
      setIsSaving(false)
    }
  }, [open, defaultName])

  if (!open) return null

  const handleSave = () => {
    if (!fileName.trim() || !workbookId) return
    setIsSaving(true)
    setTimeout(() => {
      onSave(fileName, workbookId)
      setIsSaving(false)
      onClose()
    }, 1500) // Simulate network delay
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-white/20 dark:border-gray-700 rounded-[28px] shadow-2xl w-full max-w-sm mx-4 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800 dark:to-gray-800">
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#4A90D9]" /> Simpan ke Workbook
          </h3>
        </div>

        <div className="p-6 space-y-5">
          {/* File Name Field */}
          <div>
            <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Nama File
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Contoh: Draft Pendahuluan Skripsi"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all"
            />
          </div>

          {/* Workbook Selection */}
          <div>
            <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Pilih Workbook
            </label>
            <Select value={workbookId} onValueChange={setWorkbookId}>
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
                <SelectValue placeholder="Pilih workbook tujuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {dummyWorkbooks.map((wb) => (
                    <SelectItem key={wb.id} value={wb.id}>
                      {wb.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/80">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="py-2.5 px-5 text-[14px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!fileName.trim() || !workbookId || isSaving}
            className="py-2.5 px-6 text-[14px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg transition-all rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
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
`

/* ─── Main Page ─── */
export default function AIWriterPage() {
  const [topik, setTopik] = useState('')
  const [instruksi, setInstruksi] = useState('')
  const [jenis, setJenis] = useState('Skripsi')
  const [bagian, setBagian] = useState('Pendahuluan')
  const [bahasa, setBahasa] = useState('Indonesian (Indonesia)')
  const [model, setModel] = useState('Auto')
  const [jumlah, setJumlah] = useState('3 Paragraf')
  const [panjang, setPanjang] = useState('1.500 kata')
  const [promptOpen, setPromptOpen] = useState(false)

  // Editor state
  const [isGenerated, setIsGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  const handleGenerate = () => {
    if (!topik.trim()) return
    setIsGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setEditorContent(DUMMY_GENERATED_HTML)
      setIsGenerated(true)
      setIsGenerating(false)
      setInputCollapsed(true)
    }, 2000)
  }

  const handleRegenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setEditorContent(DUMMY_GENERATED_HTML)
      setIsGenerating(false)
    }, 1500)
  }

  const handleReset = () => {
    setIsGenerated(false)
    setEditorContent('')
    setInputCollapsed(false)
  }

  const handleCopy = () => {
    const temp = document.createElement('div')
    temp.innerHTML = editorContent
    navigator.clipboard.writeText(temp.textContent || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadDoc = () => {
    const fileName = topik.slice(0, 40) || 'ai-writer'
    const htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office"
                  xmlns:w="urn:schemas-microsoft-com:office:word"
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head><meta charset="utf-8"><title>${fileName}</title>
            <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;margin:2.54cm;}h1{font-size:16pt;font-weight:bold;}h2{font-size:14pt;font-weight:bold;}h3{font-size:12pt;font-weight:bold;}blockquote{border-left:3px solid #888;padding-left:12px;color:#555;font-style:italic;}</style>
            </head><body>${editorContent}</body></html>`
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.doc`
    a.click()
    URL.revokeObjectURL(url)
    setDownloadOpen(false)
  }

  const handleDownloadPdf = () => {
    const fileName = topik.slice(0, 40) || 'ai-writer'
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
            <html><head><title>${fileName}</title>
            <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;margin:2.54cm;color:#1f2937;}h1{font-size:18pt;font-weight:bold;margin-bottom:8pt;}h2{font-size:15pt;font-weight:bold;margin-bottom:6pt;}h3{font-size:13pt;font-weight:bold;margin-bottom:4pt;}blockquote{border-left:3px solid #888;padding-left:12px;color:#555;font-style:italic;}ul{list-style:disc;padding-left:24pt;}ol{list-style:decimal;padding-left:24pt;}@media print{body{margin:0;}}</style>
            </head><body>${editorContent}</body></html>`)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
    setDownloadOpen(false)
  }

  const handleSaveToWorkbook = (fileName, targetWorkbookId) => {
    const wbName = dummyWorkbooks.find((wb) => wb.id === targetWorkbookId)?.name
    // Logic to save goes here
    setSaveSuccessMsg(`Berhasil disimpan sebagai "${fileName}" ke ${wbName}`)
    setTimeout(() => setSaveSuccessMsg(''), 4000)
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 overflow-y-auto transition-colors duration-300 overflow-x-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 z-0 bg-[#f7f7f5] dark:bg-[#0f141e] pointer-events-none" />

      {/* Soft Glow Orbs - Hidden on mobile, visible on md and up */}
      {/* <div className="hidden md:block absolute top-20 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="hidden md:block absolute top-40 right-1/4 w-80 h-80 bg-purple-400/5 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div> */}

      {/* Header */}
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center my-6">
        <div className=" flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            AI Writer
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed max-w-xl mx-auto px-4">
          Buat karya tulis ilmiah berkualitas tinggi dengan bantuan AI.
          <span className="hidden sm:inline">
            {' '}
            Pilih jenis karya, bahasa, dan model AI favorit Anda.
          </span>
        </p>
      </div>

      {/* Main Form Card */}
      <div className="w-full max-w-3xl relative z-10">
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
            {inputCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        )}

        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${inputCollapsed ? 'max-h-0 opacity-0 transform -translate-y-4' : 'max-h-[2000px] opacity-100 transform translate-y-0'}`}
        >
          {/* Topic Textarea */}
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[20px] md:rounded-[24px] shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4 md:mb-6">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <label className="text-[12px] md:text-[13px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Topik Penelitian
                </label>
                <button
                  type="button"
                  onClick={() => setPromptOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-1.5 text-[11px] md:text-[12px] font-semibold text-[#4A90D9] bg-[#4A90D9]/10 border border-[#4A90D9]/20 rounded-lg md:rounded-xl hover:bg-[#4A90D9]/20 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Prompt Library</span>
                  <span className="xs:hidden">Prompt</span>
                </button>
              </div>
              <textarea
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder={
                  'Masukkan topik penelitian dan kebutuhan Anda.\n\nContoh:\nTulis esai akademik tentang "Dampak Jangka Panjang Perubahan Iklim terhadap Ekosistem Laut."'
                }
                rows={5}
                className="w-full bg-transparent text-[14px] md:text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-end mt-2">
                <span className="text-[11px] md:text-[12px] text-gray-400">
                  {topik.length}/12,000
                </span>
              </div>
            </div>
          </div>

          {/* Dropdowns Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Jenis Karya Tulis */}
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
              <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                Jenis Karya
              </label>
              <Select value={jenis} onValueChange={setJenis}>
                <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectGroup>
                    {jenisKarya.map((j) => (
                      <SelectItem key={j} value={j} className="py-2.5 pl-8 pr-3">
                        {j}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Bagian Karya */}
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
              <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                Bagian Karya
              </label>
              <Select value={bagian} onValueChange={setBagian}>
                <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                  <SelectValue placeholder="Pilih bagian" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectGroup>
                    {bagianKarya.map((b) => (
                      <SelectItem key={b} value={b} className="py-2.5 pl-8 pr-3">
                        {b}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Bahasa */}
            <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
              <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
                Bahasa
              </label>
              <Select value={bahasa} onValueChange={setBahasa}>
                <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Pilih bahasa">
                    <div className="flex items-center gap-2">
                      <span
                        className={`${LANGUAGES.find((l) => l.text === bahasa)?.img || 'fi fi-id'} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
                      ></span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {bahasa.split(' (')[0]}
                      </span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] rounded-xl dark:bg-gray-800 dark:border-gray-700">
                  <SelectGroup>
                    <SelectLabel>Bahasa</SelectLabel>
                    {LANGUAGES.map((lang) => (
                      <SelectItem
                        key={lang.text}
                        value={lang.text}
                        className="cursor-pointer py-2.5 pl-8 pr-3 hover:bg-blue-50 focus:bg-blue-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors rounded-lg mx-1 my-0.5"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`${lang.img} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
                          ></span>
                          <span className="font-medium text-gray-700 dark:text-gray-200">
                            {lang.text.split(' (')[0]}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-[11px] ml-auto hidden sm:inline-block">
                            {lang.text.includes('(')
                              ? lang.text.split('(')[1].replace(')', '')
                              : ''}
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
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[24px] p-4 md:p-6 mb-4 md:mb-6 shadow-sm hover:shadow-md transition-shadow">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Instruksi Tambahan{' '}
              <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">
                (opsional)
              </span>
            </label>
            <textarea
              value={instruksi}
              onChange={(e) => setInstruksi(e.target.value)}
              placeholder="Tambahkan instruksi khusus..."
              rows={2}
              className="w-full bg-transparent text-[13px] md:text-[14px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-3 md:p-5 mb-6 md:mb-8 shadow-sm overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 md:gap-4 w-max min-w-full pb-1 md:pb-0">
              <ToolbarSelect
                label="Model"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                options={modelOptions}
                value={model}
                onChange={setModel}
              />
              <ToolbarSelect
                label="Jumlah"
                icon={<FileText className="w-3.5 h-3.5 text-blue-500" />}
                options={jumlahHasil}
                value={jumlah}
                onChange={setJumlah}
              />
              <ToolbarSelect
                label="Maks"
                icon={<Ruler className="w-3.5 h-3.5 text-gray-500" />}
                options={panjangMaks}
                value={panjang}
                onChange={setPanjang}
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6 px-1">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topik.trim()}
              className="relative group w-full py-3.5 md:py-4 bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] text-white text-[14px] md:text-[15px] font-bold rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menghasilkan...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    Generate Sekarang
                  </>
                )}
              </span>
            </button>
            <button className="w-full py-3.5 md:py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[14px] md:text-[15px] font-bold rounded-xl md:rounded-2xl hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
              Generate Bertahap
            </button>
          </div>
        </div>

        {/* ─── Tiptap Editor Output ─── */}
        {isGenerating && !isGenerated && (
          <div className="mb-8">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex gap-1.5">
                  <div
                    className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
                <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                  AI sedang menulis...
                </span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 px-1 md:px-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] md:text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hasil
                </span>
                <span className="text-[10px] md:text-[11px] font-medium text-[#4A90D9] bg-[#4A90D9]/10 px-2 py-0.5 rounded-md">
                  {bagian}
                </span>
                {saveSuccessMsg && (
                  <span className="text-[11px] md:text-[12px] font-medium text-green-600 dark:text-green-400 animate-pulse bg-green-50 dark:bg-green-900/20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">
                    ✓ {saveSuccessMsg}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[12px] md:text-[13px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-blue-500 shadow-md hover:shadow-lg rounded-[10px] md:rounded-xl transition-all active:scale-95 whitespace-nowrap"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Simpan ke Workbook</span>
                  <span className="sm:hidden">Simpan</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-3 md:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[12px] font-medium text-gray-600 dark:text-gray-300 rounded-[10px] md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setDownloadOpen(!downloadOpen)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-3 md:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[12px] font-medium text-gray-600 dark:text-gray-300 rounded-[10px] md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
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
                            <span className="text-[11px] text-gray-400">
                              Dokumen Microsoft Word
                            </span>
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
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-3 md:py-2 border border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[12px] font-medium rounded-[10px] md:rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors shadow-sm disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Regenerate</span>
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
                  const temp = document.createElement('div')
                  temp.innerHTML = editorContent
                  const text = temp.textContent || ''
                  const words = text.trim().split(/\s+/).filter(Boolean).length
                  return `${words} kata`
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

        {/* Example Cards */}
        {!isGenerated && !isGenerating && (
          <div className="mb-6">
            <h3 className="text-[12px] md:text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 md:mb-5 px-1 md:px-0">
              Library Terbaru
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 px-1 md:px-0">
              {exampleCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => setTopik(card.title)}
                  className="group text-left bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/40 dark:border-gray-700/50 rounded-[16px] md:rounded-[20px] p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 block"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-[6px]">
                      Ide Topik
                    </span>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-gray-800 dark:text-gray-200 font-semibold leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-3">
                    "{card.title}"
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="text-[10px] md:text-[11px] bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-[4px]">
                      {card.jenis}
                    </span>
                    <span className="text-[10px] md:text-[11px] bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-[4px]">
                      {card.bagian}
                    </span>
                  </div>
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

      {/* Save Workbook Modal */}
      <SaveWorkbookModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        defaultName={topik.slice(0, 50)} // Auto-fill with a snippet of the context/topic
        onSave={handleSaveToWorkbook}
      />
    </div>
  )
}
