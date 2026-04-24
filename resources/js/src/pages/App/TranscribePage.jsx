import { ArrowLeft, Download, FileAudio, Loader2, Mic, Upload, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import RecordingPanel from '@/components/transcribe/RecordingPanel'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

function TranscriptionResultView({ transcriptionResult, handleReset, handleExport }) {
  const [animKey, setAnimKey] = useState(0)

  // Re-trigger slideUp setiap kali data berubah
  useEffect(() => {
    if (transcriptionResult) {
      setAnimKey((k) => k + 1)
      console.log(transcriptionResult)
    }
  }, [transcriptionResult])

  if (!transcriptionResult) return null

  return (
    <div className="flex flex-col items-center max-w-5xl w-full relative pt-12 md:pt-0">
      <div
        key={`back-${animKey}`}
        className="absolute top-18 md:top-4 left-0 animate-[slideUp_0.3s_ease-out_both]"
      >
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-orange-400 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Transcribe
        </button>
      </div>

      <div
        key={`card-${animKey}`}
        className="w-full mt-20 md:mt-18 mb-6 bg-white dark:bg-gray-800 rounded-[24px] shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row animate-[slideUp_0.45s_ease-out_both]"
      >
        {/* ── Left panel ── */}
        <div className="w-full md:w-1/3 p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
          <h2
            className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 truncate"
            title={transcriptionResult.title}
          >
            {transcriptionResult.title}
          </h2>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
            <span className="flex items-center gap-1.5">
              <Mic className="w-4 h-4" /> {transcriptionResult.speakers} Speaker
              {transcriptionResult.speakers > 1 ? 's' : ''}
            </span>
            <span>•</span>
            <span>{transcriptionResult.duration}</span>
          </div>

          {transcriptionResult.summary?.length > 0 && (
            <>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
                Summary
              </h3>
              <ul className="space-y-4 overflow-hidden">
                {transcriptionResult.summary.map((point, idx) => (
                  <li
                    key={`${animKey}-summary-${idx}`}
                    className="flex gap-3 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    style={{
                      animation: 'slideUp 0.4s ease-out both',
                      animationDelay: `${0.1 + idx * 0.06}s`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-orange-400 mt-2 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Transcript</h3>
            <button
              onClick={handleExport}
              className="text-[13px] flex gap-2 items-center font-semibold text-blue-600 dark:text-orange-400 hover:text-blue-500 dark:hover:text-orange-300 transition-colors bg-blue-50 dark:bg-orange-900/20 hover:bg-blue-100 dark:hover:bg-orange-900/40 px-4 py-2 rounded-xl"
            >
              <Download size={18} /> Export
            </button>
          </div>

          <div className="flex-1 overflow-hidden pr-2 space-y-6">
            {transcriptionResult.transcript.map((item, idx) => (
              <div
                key={`${animKey}-transcript-${idx}`}
                className="flex flex-col sm:flex-row gap-2 sm:gap-4 group"
                style={{
                  animation: 'slideUp 0.4s ease-out both',
                  animationDelay: `${0.15 + idx * 0.04}s`,
                }}
              >
                <div className="sm:w-20 flex-shrink-0 flex items-center gap-2 mr-2">
                  <span className="text-[12px] font-mono text-gray-400 dark:text-gray-500 bg-black/10 dark:bg-black/20 px-2 py-1 rounded-md text-center">
                    {item.time}
                  </span>
                </div>
                <div className="flex-1">
                  {item.speaker && (
                    <span className="text-[13px] font-bold mb-1 block text-blue-600 dark:text-orange-400">
                      {item.speaker}
                    </span>
                  )}
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed group-hover:bg-gray-50 dark:group-hover:bg-gray-700/50 rounded-xl sm:-mx-3 sm:px-3 py-1.5 transition-colors">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const parseTranscript = (rawText) => {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  return lines.map((line) => {
    const match = line.match(/^\[\s*(.*?)\s*\]\s*(.*)$/)

    if (match) {
      return {
        time: match[1].trim(),
        speaker: 'Speaker',
        text: match[2].trim(),
      }
    }

    return {
      time: '',
      speaker: 'Speaker',
      text: line,
    }
  })
}

export default function TranscribePage() {
  const { showSnackbar } = useSnackbar()

  const [activeTab, setActiveTab] = useState('landing')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState(null)
  const [currentHistoryId, setCurrentHistoryId] = useState(null)
  const [activeTranscriptionId, setActiveTranscriptionId] = useState(null)

  const fileInputRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  useEffect(() => {
    const handleLoadHistory = (e) => {
      const item = e.detail

      const transcript = parseTranscript(item.data || '')

      setTranscriptionResult({
        title: item.name || 'Transcription',
        duration: '',
        speakers: 1,
        summary: [],
        transcript,
      })

      setCurrentHistoryId(item.id)
      setIsProcessing(false)
      setActiveTab('landing')
    }

    window.addEventListener('loadHistoryTranscribe', handleLoadHistory)
    return () => window.removeEventListener('loadHistoryTranscribe', handleLoadHistory)
  }, [])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (e.detail.path !== '/transcribe') return
      if (e.detail.id === currentHistoryId) {
        setTranscriptionResult(null)
        setCurrentHistoryId(null)
      }
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [currentHistoryId])

  // Check for active transcription on component mount
  useEffect(() => {
    const checkActiveTranscription = async () => {
      try {
        const res = await request('/transcribes/active', {
          method: 'GET',
        })

        if (res.active && res.data) {
          setActiveTranscriptionId(res.data.id)
          setIsProcessing(true)
          // Start polling immediately
          startPolling(res.data.id)
        }
      } catch (err) {
        console.error('Failed to check active transcription:', err)
      }
    }

    checkActiveTranscription()

    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ganti startPolling dengan ini
  const startPolling = (transcriptionId) => {
    // Pastikan tidak ada polling yang jalan sebelumnya
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }

    const pollStatus = async () => {
      try {
        const res = await request(`/transcribes/${transcriptionId}/status`, {
          method: 'GET',
        })

        if (res.status === 'completed') {
          // Stop polling DULU sebelum apapun
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null

          const transcript = parseTranscript(res.data || '')
          setTranscriptionResult({
            title: res.name || 'Transcription',
            duration: '',
            speakers: 1,
            summary: [],
            transcript,
          })
          setCurrentHistoryId(res.id)
          setIsProcessing(false)
          setActiveTranscriptionId(null)

          window.dispatchEvent(
            new CustomEvent('transcribeCompleted', {
              detail: {
                id: res.id,
                name: res.name?.slice(0, 60),
                data: res.data,
                source: res.source,
                time: new Date().toLocaleString('id-ID'),
              },
            }),
          )
        } else if (res.status === 'failed') {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null

          setIsProcessing(false)
          setActiveTranscriptionId(null)
          showSnackbar('error', `Transcription failed: ${res.error_message || 'Unknown error'}`)
        }
        // pending/processing → lanjut polling
      } catch (err) {
        console.error('Polling error:', err)
      }
    }

    // Poll tiap 15 detik, tapi langsung poll sekali dulu
    pollStatus()
    pollingIntervalRef.current = setInterval(pollStatus, 15000)
  }

  const handleExport = () => {
    const lines = transcriptionResult.transcript
      .map((item) => `[${item.time}] ${item.speaker}: ${item.text}`)
      .join('\n')
    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${transcriptionResult.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const submitTranscription = async ({ source, file, videoUrl }) => {
    // Check if already transcribing
    if (activeTranscriptionId && isProcessing) {
      showSnackbar(
        'warning',
        'You already have a transcription in progress. Please wait for it to complete.',
      )
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('source', source)

      if (source === 'youtube') {
        formData.append('video_url', videoUrl)
      } else {
        formData.append('file', file)
      }

      const res = await request('/transcribes', {
        method: 'POST',
        body: formData,
      })

      // Store the transcription ID and start polling
      setActiveTranscriptionId(res.id)
      showSnackbar('success', 'Transcription started. Processing in the background...')

      // Start polling for status updates
      startPolling(res.id)
    } catch (err) {
      setIsProcessing(false)
      setActiveTranscriptionId(null)

      if (err.message?.includes('409') || err.activeStatus) {
        showSnackbar(
          'warning',
          'You already have a transcription in progress. Please wait for it to complete.',
        )
      } else {
        showSnackbar('error', err.message || 'Failed to start transcription')
      }
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]

    if (file) {
      setUploadedFile(file)
      setActiveTab('upload')
    }
    e.target.value = ''
  }

  const handleUploadTranscribe = () => {
    submitTranscription({ source: 'upload', file: uploadedFile })
  }

  const handleYouTubeTranscribe = () => {
    if (!youtubeUrl.trim()) return
    submitTranscription({ source: 'youtube', videoUrl: youtubeUrl })
  }

  const handleRecordDone = (audioFile) => {
    setActiveTab('landing')
    submitTranscription({
      source: 'record',
      file: audioFile,
    })
  }

  const handleReset = () => {
    setActiveTab('landing')
    setYoutubeUrl('')
    setUploadedFile(null)
    setIsProcessing(false)
    setTranscriptionResult(null)
    setActiveTranscriptionId(null)
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] flex flex-col items-center justify-center px-6">
      {transcriptionResult ? (
        <TranscriptionResultView
          transcriptionResult={transcriptionResult}
          handleReset={handleReset}
          handleExport={handleExport}
        />
      ) : isProcessing ? (
        <div className="flex flex-col items-center justify-center max-w-md w-full py-12">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-600 dark:bg-orange-500 rounded-full blur-2xl opacity-20 animate-pulse scale-150" />
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl relative z-10 border border-gray-100 dark:border-gray-700">
              <Loader2 className="w-10 h-10 text-blue-600 dark:text-orange-400 animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 animate-pulse">
            Transcribing...
          </h2>
          {/* <p className="text-blue-600 dark:text-orange-400 font-bold text-3xl mb-4 tracking-tight drop-shadow-sm">
            {processingProgress}%
          </p> */}
          <p className="text-gray-500 dark:text-gray-400 text-[15px] text-center max-w-[280px]">
            Analyzing audio and generating transcription. Please hold on.
          </p>
          <div className="w-64 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mt-8 overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-blue-400 to-blue-600 dark:from-orange-400 dark:to-orange-500 rounded-full animate-shimmer" />
          </div>
        </div>
      ) : activeTab === 'record' ? (
        <RecordingPanel onCancel={handleReset} onTranscribe={handleRecordDone} />
      ) : activeTab === 'youtube' ? (
        <div className="flex flex-col items-center max-w-xl w-full">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
            <div className="w-7 h-5 bg-red-600 rounded-[4px] flex items-center justify-center">
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">YouTube Link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-6 text-center">
            Paste a YouTube video link to transcribe its audio.
          </p>

          <div className="w-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 text-amber-500 dark:text-amber-400">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300 mb-1.5">
                  Persyaratan Video YouTube
                </p>
                <ul className="space-y-1">
                  {[
                    'Durasi maksimal 2 jam',
                    'Video harus bersifat publik atau tidak terdaftar (unlisted)',
                    'Video harus memiliki audio yang jelas',
                    'Konten dengan hak cipta ketat mungkin tidak dapat diproses',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[13px] text-amber-700 dark:text-amber-400"
                    >
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-1 flex gap-2 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:ring-orange-400/20 focus-within:border-blue-500 dark:focus-within:border-orange-400 transition-all">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleYouTubeTranscribe()}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none px-4 py-3"
            />
            <button
              onClick={handleYouTubeTranscribe}
              disabled={!youtubeUrl.trim()}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${
                youtubeUrl.trim()
                  ? 'bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-500 dark:hover:bg-orange-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              Transcribe
            </button>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      ) : activeTab === 'upload' ? (
        <div className="flex flex-col items-center max-w-md w-full">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
            <FileAudio className="w-6 h-6 text-blue-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            File Uploaded
          </h2>

          {uploadedFile && (
            <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4 mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-5 h-5 text-blue-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-800 dark:text-gray-100 truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400">
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleReset}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleUploadTranscribe}
            className="mt-8 px-8 py-3.5 w-full bg-blue-600 dark:bg-orange-500 text-white text-[15px] font-bold rounded-xl shadow-md hover:bg-blue-500 dark:hover:bg-orange-400 hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Start Transcription
          </button>

          <button
            onClick={handleReset}
            className="mt-4 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*,.mp3,.wav,.mp4,.m4a,.ogg,.webm"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center max-w-3xl w-full relative pt-12 md:pt-0">
            <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
              <Mic className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
              Transcribe
            </h1>

            <p className="text-gray-500 dark:text-gray-400 text-[15px] text-center mb-10 max-w-lg leading-relaxed">
              Get instant transcriptions and summaries from your meetings, lectures, and more.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-blue-400/40 dark:hover:border-orange-400/40 shadow-sm hover:shadow-md rounded-2xl p-6 sm:p-8 transition-all"
              >
                <Upload className="w-6 h-6 text-[#2686D4] dark:text-[#F2901E]" />
                <span className="text-[14px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Upload File
                </span>
              </button>

              <button
                onClick={() => setActiveTab('youtube')}
                className="group flex flex-col items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-red-400/40 shadow-sm hover:shadow-md rounded-2xl p-6 sm:p-8 transition-all"
              >
                <div className="w-7 h-5 bg-red-600 rounded-[4px] flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-0.5" />
                </div>
                <span className="text-[14px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  YouTube Link
                </span>
              </button>

              <button
                onClick={() => setActiveTab('record')}
                className="group flex flex-row sm:flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-orange-400 shadow-sm hover:shadow-md rounded-2xl p-6 sm:p-8 transition-all col-span-2 sm:col-span-1"
              >
                <Mic className="w-6 h-6 text-[#2686D4] dark:text-[#F2901E]" />
                <span className="text-[14px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Start Recording
                </span>
              </button>
            </div>

            <p className="text-[12px] text-gray-400 mt-8">
              Supports MP3, WAV, MP4, M4A, OGG, WebM • Max 25MB
            </p>
          </div>
        </>
      )}
    </div>
  )
}
