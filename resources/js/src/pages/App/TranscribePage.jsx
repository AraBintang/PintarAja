import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Mic, Youtube, FileAudio, X, Loader2, Check, ArrowLeft, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TranscribePage() {
    const [activeTab, setActiveTab] = useState(null); // 'upload' | 'youtube' | 'record'
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [transcriptionResult, setTranscriptionResult] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);

    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);
    const animFrameRef = useRef(null);
    const timerRef = useRef(null);

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setActiveTab('upload')
    }
  }

    // ─── Canvas Waveform Drawing ───
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        const analyser = analyserRef.current;
        if (!canvas || !analyser) return;

        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let frame = 0;

        const draw = () => {
            animFrameRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);
            frame++;

            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // ─── Premium Bar Equalizer ───
            const barWidth = 3;
            const gap = 2;
            const totalBars = Math.floor(w / (barWidth + gap));
            const step = Math.max(1, Math.floor(bufferLength / totalBars));
            const centerX = w / 2;

            for (let i = 0; i < totalBars; i++) {
                const dataIndex = i * step;
                const rawValue = dataArray[dataIndex] || 0;

                // Smooth idle animation when there's no input
                const idleWave = Math.sin((i * 0.15) + (frame * 0.04)) * 0.08 + 0.08;
                const value = Math.max(idleWave, rawValue / 255);

                const minBarH = 3;
                const barHeight = Math.max(minBarH, value * h * 0.85);
                const xPos = i * (barWidth + gap);
                const yPos = (h - barHeight) / 2;

                // Distance from center for color gradient
                const distFromCenter = Math.abs(xPos - centerX) / centerX;

                // Gradient color: blue in center -> purple at edges
                const r = Math.round(59 + distFromCenter * 90);
                const g = Math.round(130 - distFromCenter * 60);
                const b = Math.round(246 - distFromCenter * 30);
                const alpha = 0.5 + value * 0.5;

                // Glow effect for active bars
                if (value > 0.3) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${value * 0.4})`;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.beginPath();
                ctx.roundRect(xPos, yPos, barWidth, barHeight, 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
        };

        draw();
    }, []);

    // ─── Start Recording ───
    const handleStartRecording = async () => {
        setActiveTab('record');
        setIsInitializing(true);
        setRecordingTime(0);
        chunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup AudioContext + Analyser for visualization
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Setup MediaRecorder for capturing audio
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
                setUploadedFile(audioFile);
                console.log("Recording complete. File size:", audioFile.size);
            };

            mediaRecorder.start(100); // collect data every 100ms
            setIsRecording(true);
            setIsInitializing(false);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Mic access denied", err);
            setIsInitializing(false);
            alert("Could not access microphone. Please check permissions.");
            setActiveTab(null);
        }
    };

    // ─── Pause / Resume ───
    const handlePauseResume = () => {
        const rec = mediaRecorderRef.current;
        if (!rec) return;

        if (isPaused) {
            rec.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            rec.pause();
            setIsPaused(true);
            clearInterval(timerRef.current);
        }
    };

    // ─── Stop Recording ───
    const stopRecording = useCallback(() => {
        clearInterval(timerRef.current);
        cancelAnimationFrame(animFrameRef.current);

        const rec = mediaRecorderRef.current;
        if (rec && rec.state !== 'inactive') {
            rec.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        analyserRef.current = null;
        mediaRecorderRef.current = null;
        setIsRecording(false);
        setIsPaused(false);
    }, []);

    // ─── Transcribe ───
    const handleTranscribe = () => {
        const savedTime = recordingTime;

        if (activeTab === 'record') {
            stopRecording();
        }

        setIsProcessing(true);
        setProcessingProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 15) + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            setProcessingProgress(progress);
        }, 300);

        setTimeout(() => {
            setIsProcessing(false);
            setProcessingProgress(100);

            // Dummy demo result
            setTranscriptionResult({
                title: activeTab === 'youtube' ? 'YouTube Video Transcription' : activeTab === 'upload' ? uploadedFile?.name || 'Uploaded File' : 'Recorded Audio',
                duration: activeTab === 'record' ? formatTime(savedTime) : '03:47',
                speakers: 1,
                summary: [
                    'Sebuah lagu yang mengungkapkan penyesalan tentang emosi dan cinta yang keliru.',
                    'Penyanyi berharap bahwa suatu saat nanti mereka bisa berbahagia dan tertawa kembali.',
                    'Keyakinan perlahan kembali setelah masa-masa sulit terlewati dan tidak ada lagi tangis.'
                ],
                transcript: [
                    { speaker: 'Singer', time: '00:00', text: '(Music begins)' },
                    { speaker: 'Singer', time: '00:09', text: 'Salahmu begini,' },
                    { speaker: 'Singer', time: '00:14', text: 'Beri api pada emosi.' },
                    { speaker: 'Singer', time: '00:23', text: 'Caramu bertutur,' },
                    { speaker: 'Singer', time: '00:29', text: 'Seperti semua karena ku.' },
                    { speaker: 'Singer', time: '00:33', text: 'Tanpamu oh tanpamu,' },
                    { speaker: 'Singer', time: '00:40', text: 'Senyumku terasa ragu.' },
                    { speaker: 'Singer', time: '00:46', text: 'Semua karena ku,' },
                    { speaker: 'Singer', time: '00:51', text: 'Bahasa cinta yang keliru.' },
                    { speaker: 'Singer', time: '00:55', text: 'Walau gagal kala mencoba,' },
                    { speaker: 'Singer', time: '01:03', text: 'Ku tak akan lekas percaya.' },
                    { speaker: 'Singer', time: '01:08', text: 'Ini bukan akhir cerita,' },
                    { speaker: 'Singer', time: '01:14', text: 'Kita cari akhir berbeda.' },
                    { speaker: 'Singer', time: '01:17', text: 'Bila nanti kita berdua tlah bahagia lagi,' },
                    { speaker: 'Singer', time: '01:26', text: 'Tiada lagi ruang tempat untuk.' },
                    { speaker: 'Singer', time: '01:31', text: 'Ku terlatih mengerti kala sedih temani,' },
                    { speaker: 'Singer', time: '01:38', text: 'Ku tak masalah asal kau disini.' },
                    { speaker: 'Singer', time: '01:41', text: 'Dan mungkin kita berdua kan tertawa lagi,' },
                    { speaker: 'Singer', time: '01:50', text: 'Tangis air mata akan pergi.' },
                    { speaker: 'Singer', time: '01:54', text: 'Ini kan terlewati,' },
                    { speaker: 'Singer', time: '01:58', text: 'Tak ada yang sendiri.' },
                    { speaker: 'Singer', time: '02:02', text: 'Kupastikan kita bahagia lagi.' },
                    { speaker: 'Singer', time: '02:04', text: 'Sampai ku temukan caraku untuk lupakanmu pergi.' },
                    { speaker: 'Singer', time: '02:08', text: 'Dan hidup mati rasa,' },
                    { speaker: 'Singer', time: '02:11', text: 'Pastikan aku untuk menunggumu.' },
                    { speaker: 'Singer', time: '02:14', text: 'Sampai pada palung kecewa.' },
                    { speaker: 'Singer', time: '02:16', text: 'Bila pada akhirnya kita menjadi asing pada kata bahagia.' },
                    { speaker: 'Singer', time: '02:24', text: 'Sialnya sayangnya,' },
                    { speaker: 'Singer', time: '02:26', text: 'Sialnya aku akan tetap percaya.' },
                    { speaker: 'Singer', time: '02:30', text: 'Suatu kala nanti.' },
                    { speaker: 'Singer', time: '02:39', text: 'Bila nanti kita berdua tlah bahagia lagi,' },
                    { speaker: 'Singer', time: '02:49', text: 'Tiada lagi ruang tempat untukku.' },
                    { speaker: 'Singer', time: '02:54', text: 'Terlatih mengerti kala sedih temani,' },
                    { speaker: 'Singer', time: '02:59', text: 'Ku tak masalah asal kau disini.' },
                    { speaker: 'Singer', time: '03:02', text: 'Dan mungkin kita berdua kan tertawa lagi,' },
                    { speaker: 'Singer', time: '03:10', text: 'Tangis air mata akan pergi.' },
                    { speaker: 'Singer', time: '03:15', text: 'Ini kan terlewati,' },
                    { speaker: 'Singer', time: '03:19', text: 'Tak ada yang sendiri.' },
                    { speaker: 'Singer', time: '03:22', text: 'Kupastikan kita bahagia lagi.' },
                    { speaker: 'Singer', time: '03:27', text: 'Kupastikan kita bahagia lagi.' },
                    { speaker: 'Singer', time: '03:32', text: 'Kupastikan kita bahagia lagi.' },
                    { speaker: 'Singer', time: '03:39', text: 'Kupastikan kita bahagia lagi.' },
                    { speaker: 'Singer', time: '03:47', text: '(Silence)' }
                ]
            });
        }, 2000);
    };

    const handleReset = () => {
        stopRecording();
        setActiveTab(null);
        setYoutubeUrl('');
        setUploadedFile(null);
        setIsRecording(false);
        setIsInitializing(false);
        setIsPaused(false);
        setIsProcessing(false);
        setProcessingProgress(0);
        setRecordingTime(0);
        setTranscriptionResult(null);
    };

    // ─── Canvas setup + animation when recording ───
    useEffect(() => {
        if (activeTab === 'record' && canvasRef.current) {
            const canvas = canvasRef.current;
            // Set canvas resolution to match display size
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * window.devicePixelRatio;
            canvas.height = rect.height * window.devicePixelRatio;
            const ctx = canvas.getContext('2d');
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    }, [activeTab]);

    // Start waveform drawing when analyser is ready
    useEffect(() => {
        if (isRecording && analyserRef.current && canvasRef.current) {
            drawWaveform();
        }
        return () => {
            cancelAnimationFrame(animFrameRef.current);
        };
    }, [isRecording, drawWaveform]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecording();
        };
    }, [stopRecording]);

    return (
        <div className="min-h-screen bg-[#f7f7f5] dark:bg-gray-900 flex flex-col items-center justify-center px-4">

            {/* Main Content */}
            {transcriptionResult ? (
                /* ─── Result State ─── */
                <div className="flex flex-col items-center max-w-5xl w-full relative pt-12 md:pt-0">
                    {/* Back Button */}
                    <div className="absolute -top-12 md:-top-16 left-0 flex items-center">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:text-[#4A90D9] transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Transcribe
                        </button>
                    </div>

                    <div className="w-full bg-white dark:bg-gray-800 rounded-[24px] shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                        {/* Summary Section */}
                        <div className="w-full md:w-1/3 p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 truncate" title={transcriptionResult.title}>
                                {transcriptionResult.title}
                            </h2>
                            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                                <span className="flex items-center gap-1.5"><Mic className="w-4 h-4" /> {transcriptionResult.speakers} Speakers</span>
                                <span>•</span>
                                <span>{transcriptionResult.duration}</span>
                            </div>

                            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">Summary</h3>
                            <ul className="space-y-4">
                                {transcriptionResult.summary.map((point, idx) => (
                                    <li key={idx} className="flex gap-3 text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4A90D9] mt-2 flex-shrink-0"></div>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Transcript Section */}
                        <div className="w-full md:w-2/3 p-6 sm:p-8 flex flex-col">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Transcript</h3>
                                <button className="text-[13px] font-semibold text-[#4A90D9] hover:text-[#387DC0] transition-colors bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-4 py-2 rounded-xl">
                                    Export Text
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                {transcriptionResult.transcript.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-2 sm:gap-4 group">
                                        <div className="sm:w-20 flex-shrink-0 flex items-center gap-2 sm:justify-start">
                                            <span className="text-[12px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{item.time}</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-[13px] font-bold mb-1 block ${item.speaker === 'Speaker 1' ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                                                {item.speaker}
                                            </span>
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
            ) : isProcessing ? (
                /* ─── Processing State ─── */
                <div className="flex flex-col items-center justify-center max-w-md w-full py-12">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-[#4A90D9] rounded-full blur-2xl opacity-20 animate-pulse scale-150"></div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl relative z-10 border border-gray-100 dark:border-gray-700">
                            <Loader2 className="w-10 h-10 text-[#4A90D9] animate-spin" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 animate-pulse">Transcribing...</h2>
                    <p className="text-[#4A90D9] font-bold text-3xl mb-4 tracking-tight drop-shadow-sm">{processingProgress}%</p>
                    <p className="text-gray-500 dark:text-gray-400 text-[15px] text-center max-w-[280px]">
                        Analyzing audio and generating intelligent summaries. Please hold on.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-64 h-2 bg-gray-100 dark:bg-gray-800 rounded-full mt-8 overflow-hidden relative shadow-inner">
                        <div
                            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-400 to-[#4A90D9] rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${processingProgress}%` }}
                        ></div>
                    </div>
                </div>
            ) : !activeTab ? (
                /* ─── Landing State ─── */
                <div className="flex flex-col items-center max-w-3xl w-full relative pt-12 md:pt-0">
                    {/* Back Button */}
                    <div className="absolute -top-12 md:-top-16 left-0 flex items-center">
                        <Link
                            to="/app/chat"
                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-gray-300 hover:text-[#4A90D9] transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Chat Mode
                        </Link>
                    </div>

                    {/* Mic Icon */}
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
                        <Mic className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">
            Transcribe
          </h1>

          {/* Subtitle */}
          <p className="text-gray-500 dark:text-gray-400 text-[15px] text-center mb-10 max-w-lg leading-relaxed">
            Get instant transcriptions and summaries from your meetings, lectures, and more.
          </p>

          {/* Three Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            {/* Upload File */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-[#4A90D9]/40 shadow-sm hover:shadow-md rounded-2xl p-6 sm:p-8 transition-all"
            >
              <Upload className="w-6 h-6 text-[#4A90D9]" />
              <span className="text-[14px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Upload File
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.mp4,.m4a,.ogg,.webm"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* YouTube Link */}
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

                        {/* Start Recording */}
                        <button
                            onClick={handleStartRecording}
                            className="group flex flex-row sm:flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 active:bg-gray-100 dark:active:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-green-400/40 shadow-sm hover:shadow-md rounded-2xl p-6 sm:p-8 transition-all col-span-2 sm:col-span-1"
                        >
                            <Mic className="w-6 h-6 text-green-500" />
                            <span className="text-[14px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                Start Recording
                            </span>
                        </button>
                    </div>

          {/* Supported Formats */}
          <p className="text-[12px] text-gray-400 mt-8">
            Supports MP3, WAV, MP4, M4A, OGG, WebM • Max 25MB
          </p>
        </div>
      ) : activeTab === 'youtube' ? (
        /* ─── YouTube Link State ─── */
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

          <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-1 flex gap-2 focus-within:ring-2 focus-within:ring-[#4A90D9]/20 focus-within:border-[#4A90D9] transition-all">
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-transparent text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none px-4 py-3"
            />
            <button
              onClick={handleTranscribe}
              disabled={!youtubeUrl.trim() || isProcessing}
              className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${
                youtubeUrl.trim() && !isProcessing
                  ? 'bg-[#4A90D9] text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transcribe'}
            </button>
          </div>

          <button
            onClick={handleReset}
            className="mt-6 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      ) : activeTab === 'upload' ? (
        /* ─── Upload State ─── */
        <div className="flex flex-col items-center max-w-md w-full">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
            <FileAudio className="w-6 h-6 text-[#4A90D9]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            File Uploaded
          </h2>

          {uploadedFile && (
            <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4 mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileAudio className="w-5 h-5 text-[#4A90D9]" />
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
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleTranscribe}
            disabled={isProcessing}
            className="mt-8 px-8 py-3.5 w-full bg-[#4A90D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isProcessing ? 'Transcribing...' : 'Start Transcription'}
          </button>

                    <button onClick={handleReset} className="mt-4 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                        <X className="w-3.5 h-3.5" /> Back
                    </button>
                </div>
            ) : activeTab === 'record' ? (
                /* ─── Recording State ─── */
                <div className="w-full max-w-4xl px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-[40px] p-6 shadow-2xl overflow-hidden relative border border-gray-100 dark:border-white/5">
                        {/* Waveform Visualization via Canvas */}
                        <div className="h-28 flex items-center justify-center relative mb-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full rounded-2xl"
                                style={{ display: 'block' }}
                            />
                        </div>

                        {/* Control Bar */}
                        <div className="flex items-center justify-between px-4 sm:px-8 pb-4 mt-2">
                            {/* Cancel Button */}
                            <button
                                onClick={handleReset}
                                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                                title="Cancel"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Status Text & Player Controls */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="flex flex-col items-center">
                                    <span className="text-gray-800 dark:text-white font-medium tracking-wide text-[15px]">
                                        {isInitializing ? 'Initializing Microphone...' : isPaused ? 'Recording Paused' : isRecording ? 'Listening...' : 'Recording Stopped'}
                                    </span>
                                    {(isRecording || isPaused) && (
                                        <span className={`text-[11px] mt-1 font-mono uppercase tracking-[0.2em] ${isPaused ? 'text-orange-500' : 'text-red-500 animate-pulse'}`}>
                                            {formatTime(recordingTime)}
                                        </span>
                                    )}
                                </div>

                                {/* Pause / Resume Button */}
                                {(isRecording || isPaused) && (
                                    <button
                                        onClick={handlePauseResume}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-md hover:scale-105 active:scale-95 duration-200 ${isPaused ? 'bg-green-500 hover:bg-green-600 border-4 border-green-200 dark:border-green-900/50' : 'bg-orange-500 hover:bg-orange-600 border-4 border-orange-200 dark:border-orange-900/50'
                                            }`}
                                        title={isPaused ? "Resume Recording" : "Pause Recording"}
                                    >
                                        {isPaused ? <Play className="w-6 h-6 ml-1" /> : <Pause className="w-6 h-6" />}
                                    </button>
                                )}
                            </div>

                            {/* Transcribe Button */}
                            <button
                                onClick={handleTranscribe}
                                disabled={!isRecording && !isPaused && recordingTime === 0}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md group focus:outline-none hover:scale-105 active:scale-95 border ${(isRecording || isPaused)
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                                    }`}
                                title="Transcribe"
                            >
                                <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    {/* Footer Cancel/Back */}
                    {!isRecording && !isPaused && (
                        <div className="mt-8 flex justify-center">
                            <button onClick={handleReset} className="text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                                <X className="w-3.5 h-3.5" /> Back to menu
                            </button>
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
