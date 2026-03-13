import { Check, Pause, Play, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function RecordingPanel({ onCancel, onTranscribe }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const animFrameRef = useRef(null)
  const timerRef = useRef(null)

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    let frame = 0

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)
      frame++

      const dpr = window.devicePixelRatio || 1
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = 3
      const gap = 2
      const totalBars = Math.floor(w / (barWidth + gap))
      const step = Math.max(1, Math.floor(bufferLength / totalBars))
      const centerX = w / 2

      for (let i = 0; i < totalBars; i++) {
        const dataIndex = i * step
        const rawValue = dataArray[dataIndex] || 0
        const idleWave = Math.sin(i * 0.15 + frame * 0.04) * 0.08 + 0.08
        const value = Math.max(idleWave, rawValue / 255)

        const minBarH = 3
        const barHeight = Math.max(minBarH, value * h * 0.85)
        const xPos = i * (barWidth + gap)
        const yPos = (h - barHeight) / 2
        const distFromCenter = Math.abs(xPos - centerX) / centerX

        const r = Math.round(59 + distFromCenter * 90)
        const g = Math.round(130 - distFromCenter * 60)
        const b = Math.round(246 - distFromCenter * 30)
        const alpha = 0.5 + value * 0.5

        if (value > 0.3) {
          ctx.shadowBlur = 8
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${value * 0.4})`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.beginPath()
        ctx.roundRect(xPos, yPos, barWidth, barHeight, 2)
        ctx.fill()
      }

      ctx.shadowBlur = 0
    }

    draw()
  }, [])

  const stopAndCleanup = useCallback(() => {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animFrameRef.current)

    const rec = mediaRecorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    analyserRef.current = null
    mediaRecorderRef.current = null
    setIsRecording(false)
    setIsPaused(false)
  }, [])

  // Auto-start recording when panel mounts
  useEffect(() => {
    const startRecording = async () => {
      setIsInitializing(true)
      chunksRef.current = []

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 2048
        source.connect(analyser)
        audioContextRef.current = audioContext
        analyserRef.current = analyser

        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }
        mediaRecorder.start(100)
        setIsRecording(true)
        setIsInitializing(false)

        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } catch (err) {
        console.error('Mic access denied', err)
        setIsInitializing(false)
        alert('Could not access microphone. Please check permissions.')
        onCancel()
      }
    }

    startRecording()
    return () => stopAndCleanup()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
  }, [])

  useEffect(() => {
    if (isRecording && analyserRef.current && canvasRef.current) {
      drawWaveform()
    }
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isRecording, drawWaveform])

  const handlePauseResume = () => {
    const rec = mediaRecorderRef.current
    if (!rec) return

    if (isPaused) {
      rec.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      rec.pause()
      setIsPaused(true)
      clearInterval(timerRef.current)
    }
  }

  const handleDone = () => {
    // Stop recording and collect the blob
    clearInterval(timerRef.current)
    cancelAnimationFrame(animFrameRef.current)

    const rec = mediaRecorderRef.current
    if (!rec || rec.state === 'inactive') return

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const audioFile = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      analyserRef.current = null
      mediaRecorderRef.current = null
      setIsRecording(false)
      setIsPaused(false)

      onTranscribe(audioFile, recordingTime)
    }

    rec.stop()
  }

  const canSubmit = isRecording || isPaused

  return (
    <div className="w-full max-w-4xl px-4">
      <div className="bg-white dark:bg-gray-800 rounded-[40px] p-6 shadow-2xl overflow-hidden relative border border-gray-100 dark:border-white/5">
        {/* Waveform */}
        <div className="h-28 flex items-center justify-center relative mb-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
          <canvas
            ref={canvasRef}
            className="w-full h-full rounded-2xl"
            style={{ display: 'block' }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 sm:px-8 pb-4 mt-2">
          {/* Cancel */}
          <button
            onClick={() => {
              stopAndCleanup()
              onCancel()
            }}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Center: status + pause button */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-gray-800 dark:text-white font-medium tracking-wide text-[15px]">
                {isInitializing
                  ? 'Initializing Microphone...'
                  : isPaused
                    ? 'Recording Paused'
                    : isRecording
                      ? 'Listening...'
                      : 'Ready'}
              </span>
              {(isRecording || isPaused) && (
                <span
                  className={`text-[11px] mt-1 font-mono uppercase tracking-[0.2em] ${
                    isPaused ? 'text-orange-500' : 'text-red-500 animate-pulse'
                  }`}
                >
                  {formatTime(recordingTime)}
                </span>
              )}
            </div>

            {(isRecording || isPaused) && (
              <button
                onClick={handlePauseResume}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 active:scale-95 duration-200 ${
                  isPaused
                    ? 'bg-green-500 hover:bg-green-600 border-4 border-green-200 dark:border-green-900/50'
                    : 'bg-orange-500 hover:bg-orange-600 border-4 border-orange-200 dark:border-orange-900/50'
                }`}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-6 h-6 ml-1" /> : <Pause className="w-6 h-6" />}
              </button>
            )}
          </div>

          {/* Done / Transcribe */}
          <button
            onClick={handleDone}
            disabled={!canSubmit}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md group focus:outline-none hover:scale-105 active:scale-95 border ${
              canSubmit
                ? 'bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-400 text-white border-blue-600 dark:border-orange-500'
                : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            title="Done — Start Transcription"
          >
            <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}
