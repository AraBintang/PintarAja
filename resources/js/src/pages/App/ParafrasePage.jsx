import { Check, ChevronDown, Copy, Hash, RotateCcw, Upload } from 'lucide-react'
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
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center mt-18 md:my-6">
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
              <div>
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-2 text-[14px] font-medium rounded-[10px] transition-all duration-200 ${
                      mode === m
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1 px-3 py-2 text-[14px] font-medium rounded-[10px] transition-all duration-200 ${
                    MORE_MODES.includes(mode) || moreOpen
                      ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  More {MORE_MODES.includes(mode) ? `(${mode})` : ''}{' '}
                  <ChevronDown className={`w-4 h-4 ml-1 ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute top-full left-0 mt-2 p-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl rounded-xl flex flex-col min-w-[160px] z-50 overflow-hidden py-1">
                    {MORE_MODES.map((m) => (
                      <button
                        key={m}
                        onClick={() => {
                          setMode(m)
                          setMoreOpen(false)
                        }}
                        className={`rounded-lg px-5 py-2.5 text-left text-[14px] transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 ${
                          mode === m
                            ? 'text-blue-600 dark:text-orange-400 font-semibold bg-blue-50 dark:bg-orange-900/20'
                            : 'text-slate-700 dark:text-gray-300'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
            <LanguageSelector selectedLang={selectedLang} onLangChange={setSelectedLang} />
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-black/10 dark:bg-black/20">
            <div className="flex-1 p-6 relative">
              <textarea
                value={inputText}
                onChange={handleInputText}
                placeholder="Enter or paste your text here and click Paraphrase to rephrase the sentence."
                className="w-full h-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed min-h-[250px] md:min-h-0"
              />

              {!inputText && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                  <button
                    onClick={handleTrySample}
                    className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#2686D4] dark:text-[#F2901E] bg-blue-50 dark:bg-orange-900/30 border border-blue-200 dark:border-orange-800 rounded-full hover:bg-blue-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
                  >
                    <Hash className="w-4 h-4" />
                    Try Sample Text
                  </button>
                  <button
                    onClick={handlePaste}
                    className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-[#2686D4] dark:text-[#F2901E] bg-blue-50 dark:bg-orange-900/30 border border-blue-200 dark:border-orange-800 rounded-full hover:bg-blue-100 dark:hover:bg-orange-900/50 transition-colors whitespace-nowrap"
                  >
                    <Copy className="w-4 h-4" />
                    Paste Text
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-3 flex items-center justify-between dark:bg-transparent">
              <span
                className={`text-[12px] ${wordCount >= 125 ? 'text-red-500 font-medium' : 'text-gray-400'}`}
              >
                {wordCount} / 125 Words
              </span>
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="text-[12px] font-medium text-[#2686D4] dark:text-[#F2901E] hover:text-blue-600 dark:hover:text-orange-300 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-black/20 dark:bg-gray-900 text-white rounded-b-3xl md:rounded-none">
            <div className="flex-1 p-6 overflow-y-auto">
              {isProcessing ? (
                <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-600 dark:border-orange-500 border-t-black/20 dark:border-t-gray-900 rounded-full animate-spin" />
                    <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                      Paraphrasing text...
                    </span>
                  </div>
                </div>
              ) : outputText ? (
                <div className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {outputText}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[250px] md:min-h-0">
                  <p className="text-[14px] text-gray-700 text-center max-w-xs leading-relaxed">
                    The resulting paraphrased text will appear here
                  </p>
                </div>
              )}
            </div>

            {outputText && (
              <div className="px-6 py-3 flex items-center justify-between bg-transparent text-gray-700 dark:text-gray-400">
                <span className="text-[12px]">{countWords(outputText)} Words</span>
                <button
                  onClick={handleCopy}
                  className="text-[12px] text-[#2686D4] dark:text-[#F2901E] hover:text-blue-600 dark:hover:text-orange-300 font-medium transition-colors flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopied ? 'Copied' : 'Copy Result'}
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
            className="flex items-center gap-2 text-[14px] font-medium bg-black dark:bg-white text-white dark:text-black hover:scale-105 transition-colors px-4 py-2.5 rounded-xl border border-transparent w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Doc
          </button>

          <button
            onClick={handleParaphrase}
            disabled={!canParaphrase}
            className={`px-10 py-3 text-[14px] font-bold rounded-full transition-all w-full sm:w-auto ${
              canParaphrase
                ? 'bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-500 dark:hover:bg-orange-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Paraphrasing...' : 'Paraphrase Text'}
          </button>

          <div className="hidden sm:block w-[130px]" />
        </div>
      </div>
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 pt-3 pb-5 z-[30] transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
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
          <div>
            <button
              onClick={handleParaphrase}
              disabled={!canParaphrase}
              className={`w-full py-3 text-[15px] font-bold rounded-full transition-all l ${
                canParaphrase
                  ? 'bg-blue-600 dark:bg-orange-500 text-white active:scale-95'
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
