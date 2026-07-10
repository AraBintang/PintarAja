import { Check, Copy, RotateCcw, Speech, Sparkles, Upload } from 'lucide-react'
import mammoth from 'mammoth'
import { useEffect, useRef, useState } from 'react'

import LanguageSelector from '@/components/LanguageSelector'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const MODES = ['Basic', 'Advanced']
const FREE_PLAN_WORD_LIMIT = 250

const sampleText = `Kecerdasan buatan (AI) telah menjadi salah satu teknologi paling transformatif di era modern. Dengan kemampuannya untuk memproses data dalam skala besar, AI memungkinkan otomatisasi berbagai tugas yang sebelumnya memerlukan campur tangan manusia. Dalam konteks pendidikan, AI telah merevolusi cara mahasiswa belajar dan menyelesaikan tugas akademik mereka.`

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0)
const limitWords = (text, maxWords) => {
  const words = text.split(/\s+/).filter(Boolean)
  return words.length > maxWords ? words.slice(0, maxWords).join(' ') : text
}

export default function HumanizerPage() {
  const { user, me } = useAuth()
  const { showSnackbar } = useSnackbar()

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [selectedLang, setSelectedLang] = useState('Indonesian (Indonesia)')
  const [mode, setMode] = useState('Basic')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentHistoryId, setCurrentHistoryId] = useState(null)
  const [isCopied, setIsCopied] = useState(false)
  const [displayedWords, setDisplayedWords] = useState([])

  const isFreePlan = Number(user?.plan_id) === 1
  const wordLimit = isFreePlan ? FREE_PLAN_WORD_LIMIT : null

  useEffect(() => {
    if (wordLimit && countWords(inputText) > wordLimit) {
      setInputText(limitWords(inputText, wordLimit))
    }
  }, [inputText, wordLimit])

  useEffect(() => {
    if (!outputText) {
      setDisplayedWords([])
      return
    }
    const words = outputText.split(' ')
    setDisplayedWords(words)
  }, [outputText])

  useEffect(() => {
    const handleLoadHistory = (e) => {
      const item = e.detail
      setCurrentHistoryId(item.id)
      setInputText(item.origin || '')
      setOutputText(item.data || '')
    }
    window.addEventListener('loadHistoryHumanizer', handleLoadHistory)
    return () => window.removeEventListener('loadHistoryHumanizer', handleLoadHistory)
  }, [])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (e.detail.path !== '/humanizer') return
      if (e.detail.id === currentHistoryId) {
        setInputText('')
        setOutputText('')
        setCurrentHistoryId(null)
      }
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [currentHistoryId])

  const handleInputText = (e) => {
    const text = e.target.value
    if (!wordLimit) {
      setInputText(text)
      return
    }

    const words = countWords(text)
    if (words <= wordLimit) {
      setInputText(text)
    } else if (text.length < inputText.length) {
      setInputText(text)
    } else {
      const cut = text.trim().split(/\s+/).slice(0, wordLimit).join(' ')
      setInputText(cut + (text.endsWith(' ') ? ' ' : ''))
    }
  }

  const handleTrySample = () => setInputText(sampleText)

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(wordLimit ? limitWords(text, wordLimit) : text)
    } catch {
      // Fallback
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

  const canHumanize = inputText.trim() && !isProcessing && (!wordLimit || wordCount <= wordLimit)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const fileType = file.name.split('.').pop().toLowerCase()
    if (fileType === 'txt') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        setInputText(wordLimit ? limitWords(text, wordLimit) : text)
      }
      reader.readAsText(file)
    } else if (fileType === 'docx') {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({ arrayBuffer: e.target.result })
          setInputText(wordLimit ? limitWords(result.value, wordLimit) : result.value)
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

  const handleHumanize = async () => {
    if (!inputText.trim() || isProcessing) return

    setIsProcessing(true)
    setOutputText('')

    try {
      const res = await request('/humans', {
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
          new CustomEvent('humanizerCompleted', {
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
      showSnackbar('error', err.message || 'Gagal memproses teks')
    } finally {
      setIsProcessing(false)
      me()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto overflow-x-hidden pt-0 pb-10 px-6 max-w-full">
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center mt-18 mb-4 md:my-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center">
            <Speech className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Humanizer AI
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed max-w-xl mx-auto px-4">
          Ubah teks tulisan AI menjadi lebih natural dan terlihat ditulis oleh manusia.
        </p>
      </div>

      <div className="max-w-[1200px] mx-auto w-full flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-3xl overflow-visible min-h-[600px] mb-28 md:mb-8 shadow-sm">
        <div className="px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-visible">
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 w-full lg:w-auto pl-1 pt-1">
              <span className="font-semibold text-slate-800 dark:text-gray-200 text-[15px] mr-1">
                Modes:
              </span>
              <div className="flex flex-wrap items-center gap-0.5 bg-gray-100 dark:bg-gray-900 rounded-xl p-1">
                {MODES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                      mode === m
                        ? 'text-orange-500 dark:text-orange-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0">
            <LanguageSelector selectedLang={selectedLang} onLangChange={setSelectedLang} />
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 relative z-10 border-t border-gray-100 dark:border-gray-800">
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60">
            <div className="flex-1 p-6 relative">
              <textarea
                value={inputText}
                onChange={handleInputText}
                placeholder="Masukkan atau tempel teks Anda di sini dan klik Humanize untuk mengubah teks AI."
                className="w-full h-full bg-transparent text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none resize-none leading-relaxed min-h-[250px] md:min-h-0"
              />

              {!inputText && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-gray-800 flex items-center justify-center">
                    <Speech className="w-5 h-5 text-orange-400 dark:text-gray-500" />
                  </div>
                  <p className="text-[13px] text-gray-400 dark:text-gray-500 font-medium text-center">
                    Paste or type your text to get started
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTrySample}
                      className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border border-orange-200 bg-orange-50 text-orange-500 dark:text-[#F2901E] hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 whitespace-nowrap rounded-full"
                    >
                      <Speech className="w-4 h-4" />
                      Try Sample
                    </button>
                    <button
                      onClick={handlePaste}
                      className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border border-orange-200 bg-orange-50 text-orange-500 dark:text-[#F2901E] hover:bg-orange-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 whitespace-nowrap rounded-full"
                    >
                      <Copy className="w-4 h-4" />
                      Paste Text
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <div className={`h-1 w-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 ${isFreePlan ? '' : 'hidden'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      wordLimit && wordCount >= wordLimit
                        ? 'bg-red-400'
                        : wordLimit && wordCount > wordLimit * 0.64
                          ? 'bg-orange-400'
                          : 'bg-orange-500'
                    }`}
                    style={{
                      width: wordLimit ? `${Math.min((wordCount / wordLimit) * 100, 100)}%` : '100%',
                    }}
                  />
                </div>
                <span className={`text-[12px] font-medium ${
                  wordLimit && wordCount >= wordLimit ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {wordLimit ? `${wordCount} / ${wordLimit} Words` : `${wordCount} Words`}
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

          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900/80 rounded-b-3xl md:rounded-none">
            <div className="flex-1 relative min-h-0">
              <div className="h-full overflow-y-auto px-6 py-6">
                {isProcessing ? (
                  <div className="flex flex-col gap-3 min-h-[250px] md:min-h-full pt-1">
                    {[100, 88, 94, 75, 90, 55].map((w, i) => (
                      <div
                        key={i}
                        className="skeleton-shimmer h-4 rounded-full"
                        style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                ) : displayedWords.length > 0 ? (
                  <p className="text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {displayedWords.map((word, i) => (
                      <span
                        key={i}
                        className="inline-block opacity-0 animate-fadeInWord mr-[0.25em]"
                        style={{
                          animationDelay: `${Math.min(i * 10, 700)}ms`,
                          animationFillMode: 'forwards',
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                ) : (
                  <div className="flex items-center justify-center min-h-[250px] md:min-h-full">
                    <div className="flex flex-col items-center gap-3 text-center max-w-xs">
                      <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                      </div>
                      <p className="text-[13px] text-gray-400 dark:text-gray-500 leading-relaxed">
                        Hasil teks yang telah di-humanize akan muncul di sini
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
                      : 'text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
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
            className="flex items-center gap-2 text-[14px] font-medium bg-[#F2901E] text-white hover:scale-95 transition-colors px-4 py-2.5 rounded-xl border border-transparent w-full sm:w-auto justify-center"
          >
            <Upload className="w-4 h-4" />
            Upload Doc
          </button>

          <button
            onClick={handleHumanize}
            disabled={!canHumanize}
            className={`px-10 py-3 text-[14px] font-bold rounded-full transition-all w-full sm:w-auto ${
              canHumanize
                ? 'bg-[#F2901E] text-white hover:bg-orange-500 hover:scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Humanize Text'}
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
            <span className="text-[14px] font-bold text-orange-500 dark:text-orange-400 mr-4">
              {mode}
            </span>
          </div>
          <div className="px-4">
            <button
              onClick={handleHumanize}
              disabled={!canHumanize}
              className={`w-full py-3 px-4 text-[15px] font-bold rounded-full transition-all ${
                canHumanize
                  ? 'bg-[#F2901E] text-white active:scale-95'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }`}
            >
              {isProcessing ? 'Processing...' : 'Humanize Text'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
