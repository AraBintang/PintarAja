import { Check, ChevronDown, Copy, Hash, RotateCcw, Sparkles, Upload } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import LanguageSelector from '@/components/LanguageSelector'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const MODES = ['Standard', 'Fluency', 'Formal', 'Academic', 'Simple', 'Creative']
const MORE_MODES = ['Expand', 'Shorten']

const sampleText = `Teknologi blockchain telah mulai merevolusi sistem keuangan digital global dengan menawarkan desentralisasi dan keamanan tinggi. Sistem ini memungkinkan transaksi dilakukan secara transparan tanpa memerlukan partisipasi dari pihak ketiga tradisional seperti bank. Di masa depan, integrasi blockchain diperkirakan akan menyebar luas ke sektor lain seperti rantai pasokan dan administrasi medis.`

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)

export default function ParafrasePage() {
  const { showSnackbar } = useSnackbar()

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedLang, setSelectedLang] = useState('Indonesian (Indonesia)')
  const [mode, setMode] = useState('Standard')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentHistoryId, setCurrentHistoryId] = useState(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const dropdownRef = useRef(null)

  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const handleLoadHistory = (e) => {
      const item = e.detail

      setCurrentHistoryId(item.id)
      setInputText(item.origin || '')
      setOutputText(item.data || '')
    }

    window.addEventListener('loadHistoryParaphrase', handleLoadHistory)
    return () => window.removeEventListener('loadHistoryParaphrase', handleLoadHistory)
  }, [])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (e.detail.path !== '/paraphrase') return
      if (e.detail.id === currentHistoryId) {
        setInputText('')
        setOutputText('')
        setCurrentHistoryId(null)
      }
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [currentHistoryId])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMoreOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputText = (e) => {
    const text = e.target.value
    const words = countWords(text)

    if (words <= 125) {
      setInputText(text)
    } else if (text.length < inputText.length) {
      setInputText(text)
    } else {
      const cut = text.trim().split(/\s+/).slice(0, 125).join(' ')
      setInputText(cut + (text.endsWith(' ') ? ' ' : ''))
    }
  }

  const handleTrySample = () => setInputText(sampleText)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const words = text.split(/\s+/).filter(Boolean)
      setInputText(words.length > 125 ? words.slice(0, 125).join(' ') : text)
    } catch {
      // Fallback: no-op
    }
  }

  const wordCount = countWords(inputText)
  const fileInputRef = useRef(null)

  const handleCopy = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const canParaphrase = inputText.trim() && !isProcessing && wordCount <= 125

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const fileType = file.name.split('.').pop().toLowerCase()

    if (fileType === 'txt') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const words = text.split(/\s+/).filter(Boolean)
        onFileLoaded(words.length > 125 ? words.slice(0, 125).join(' ') : text)
      }
      reader.readAsText(file)
    } else if (fileType === 'docx') {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result })
          const words = result.value.split(/\s+/).filter(Boolean)
          onFileLoaded(words.length > 125 ? words.slice(0, 125).join(' ') : result.value)
        } catch (error) {
          console.error('Error parsing docx:', error)
          alert('Gagal membaca file Word.')
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      alert('Format file tidak didukung. Harap upload .txt atau .docx')
    }

    event.target.value = ''
  }

  const handleParaphrase = async () => {
    if (!inputText.trim() || isProcessing) return

    setIsProcessing(true)
    setOutputText('')

    try {
      const res = await request('/paraps', {
        method: 'POST',
        body: {
          text: inputText,
          mode: mode.toLowerCase(),
          language: selectedLang,
        },
      })

      setOutputText(res.data)

      if (res.id) {
        setCurrentHistoryId(res.id)
        window.dispatchEvent(
          new CustomEvent('paraphraseCompleted', {
            detail: {
              id: res.id,
              title: inputText.slice(0, 60),
              name: inputText.slice(0, 60),
              data: res.data,
              origin: inputText,
              time: new Date().toLocaleString('id-ID'),
            },
          }),
        )
      }
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal memparafrase teks')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto overflow-x-hidden pt-0 pb-10 px-6 max-w-full">
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center mt-18 mb-4 md:my-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center">
            <Hash className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Paraphrase AI
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed max-w-xl mx-auto px-4">
          Susun ulang teks Anda untuk meningkatkan keterbacaan dan menghindari plagiarisme.
        </p>
      </div>
      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-visible min-h-[600px] mb-28 md:mb-8 shadow-sm">
        <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-visible">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 w-full lg:w-auto pl-1 pt-1">
              <span className="font-semibold text-slate-800 dark:text-gray-200 text-[15px] mr-1">
                Modes:
              </span>

              {/* Main modes */}
              <div className="flex flex-wrap items-center gap-0.5 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                      mode === m
                        ? ' text-blue-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMoreOpen(!moreOpen)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                      MORE_MODES.includes(mode) || moreOpen
                        ? 'text-blue-600 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {MORE_MODES.includes(mode) ? <>{mode}</> : 'More'}
                    <motion.span
                      animate={{ rotate: moreOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                        className="absolute top-full left-0 mt-2 p-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl flex flex-col min-w-[160px] z-50"
                      >
                        {MORE_MODES.map((m, i) => (
                          <motion.button
                            key={m}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => {
                              setMode(m)
                              setMoreOpen(false)
                            }}
                            className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                              mode === m
                                ? 'text-blue-600 dark:text-orange-400 font-semibold bg-blue-50 dark:bg-orange-900/20'
                                : 'text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                            }`}
                          >
                            {mode === m && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400 shrink-0" />
                            )}
                            <span className={mode === m ? '' : 'pl-4'}>{m}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* More dropdown */}
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
            <LanguageSelector selectedLang={selectedLang} onLangChange={setSelectedLang} />
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 border-t border-gray-100 dark:border-gray-800">
          {/* Input Panel */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <div className="flex-1 p-6 relative">
              {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100 dark:from-gray-900/80 to-transparent z-10 pointer-events-none rounded-t-none" /> */}

              <textarea
                value={inputText}
                onChange={handleInputText}
                placeholder="Enter or paste your text here and click Paraphrase to rephrase the sentence."
                className="w-full h-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none resize-none leading-relaxed min-h-[250px] md:min-h-0"
              />

              {!inputText && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-gray-800 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-blue-400 dark:text-gray-500" />
                  </div>
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
                    Paste or type your text to get started
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTrySample}
                      className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border border-blue-200 bg-blue-50 text-[#2686D4] dark:text-[#F2901E] hover:bg-blue-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 whitespace-nowrap rounded-full"
                    >
                      <Hash className="w-4 h-4" />
                      Try Sample Text
                    </button>
                    <button
                      onClick={handlePaste}
                      className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border border-blue-200 bg-blue-50 text-[#2686D4] dark:text-[#F2901E] hover:bg-blue-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 whitespace-nowrap rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                      Paste Text
                    </button>
                  </div>
                </div>
              )}

              {/* <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 dark:from-gray-900/80 to-transparent z-10 pointer-events-none" /> */}
            </div>

            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div
                  className={`h-1 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      wordCount >= 125
                        ? 'bg-red-400'
                        : wordCount > 80
                          ? 'bg-orange-400'
                          : 'bg-blue-400 dark:bg-orange-400'
                    }`}
                    style={{ width: `${Math.min((wordCount / 125) * 100, 100)}%` }}
                  />
                </div>
                <span
                  className={`text-[12px] font-medium ${wordCount >= 125 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {wordCount} / 125 Words
                </span>
              </div>
              <button
                disabled={!inputText}
                onClick={() => setInputText('')}
                className="px-2 py-1 text-[12px] font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900/80 rounded-b-3xl md:rounded-none">
            {/* Wrapper relative untuk fade effect */}
            <div className="flex-1 relative min-h-0">
              {/* Fade top */}
              {/* <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-gray-100 dark:from-gray-900/80 to-transparent z-10 pointer-events-none rounded-t-none" /> */}

              {/* Scrollable content */}
              <div className="h-full overflow-y-auto px-6 py-6">
                {isProcessing ? (
                  <div className="flex items-center justify-center min-h-[250px] md:min-h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative w-10 h-10">
                        <div className="absolute inset-0 rounded-full border-2 border-blue-100 dark:border-gray-800" />
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 dark:border-t-orange-400 animate-spin" />
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[13px] font-semibold text-gray-600 dark:text-gray-300">
                          Paraphrasing...
                        </span>
                        <span className="text-[12px] text-gray-400 dark:text-gray-500">
                          This may take a moment
                        </span>
                      </div>
                    </div>
                  </div>
                ) : outputText ? (
                  <p className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {outputText}
                  </p>
                ) : (
                  <div className="flex items-center justify-center min-h-[250px] md:min-h-full">
                    <div className="flex flex-col items-center gap-3 text-center max-w-xs">
                      <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-[13px] text-gray-400 dark:text-gray-500 leading-relaxed">
                        Your paraphrased text will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fade bottom */}
              {/* <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-100 dark:from-gray-900/80 to-transparent z-10 pointer-events-none" /> */}
            </div>

            {outputText && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
                <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
                  {countWords(outputText)} words
                </span>
                <button
                  onClick={handleCopy}
                  className={`text-[12px] font-semibold flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all ${
                    isCopied
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-blue-500 dark:text-orange-400 hover:bg-blue-50 dark:hover:bg-orange-900/20'
                  }`}
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>

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
            className="flex items-center gap-2 text-[14px] font-medium bg-[#2686D4] dark:bg-[#F2901E] text-white hover:scale-95 transition-colors px-4 py-2.5 rounded-xl border border-transparent w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Doc
          </button>

          <button
            onClick={handleParaphrase}
            disabled={!canParaphrase}
            className={`px-10 py-3 text-[14px] font-bold rounded-full transition-all w-full sm:w-auto ${
              canParaphrase
                ? 'bg-[#2686D4] dark:bg-[#F2901E] text-white hover:bg-blue-500 dark:hover:bg-orange-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Paraphrasing...' : 'Paraphrase Text'}
          </button>

          <div className="hidden sm:block w-[130px]" />
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pt-3 pb-5 z-[30] transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.docx"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center text-[14px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:scale-105 transition-colors px-3 py-2.5 rounded-xl border border-transparent w-full sm:w-auto justify-center"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
            <span className="text-[14px] font-bold text-blue-600 dark:text-orange-400 mr-4">
              {mode}
            </span>
          </div>
          <div className="px-4">
            <button
              onClick={handleParaphrase}
              disabled={!canParaphrase}
              className={`w-full py-3 px-4 text-[15px] font-bold rounded-full transition-all ${
                canParaphrase
                  ? 'bg-[#2686D4] dark:bg-[#F2901E] text-white active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isProcessing ? 'Paraphrasing...' : 'Paraphrase Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
