import React, { useState, useRef } from 'react';
import { Upload, Mic, Youtube, FileAudio, X, Loader2, Check, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TranscribePage() {
    const [activeTab, setActiveTab] = useState(null); // 'upload' | 'youtube' | 'record'
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [stream, setStream] = useState(null);
    const fileInputRef = useRef(null);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);

    // Format seconds to HH:MM:SS
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            setActiveTab('upload');
        }
    };

    const handleStartRecording = async () => {
        try {
            console.log("Requesting microphone access...");
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);

            // Detection for best supported mime type
            const mimeTypes = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/wav'];
            let selectedType = '';
            for (const type of mimeTypes) {
                if (MediaRecorder.isTypeSupported(type)) {
                    selectedType = type;
                    break;
                }
            }
            console.log("Selected MimeType:", selectedType);

            const recorder = new MediaRecorder(audioStream, selectedType ? { mimeType: selectedType } : {});
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                console.log("Recording stopped, gathering chunks:", chunksRef.current.length);
                const audioBlob = new Blob(chunksRef.current, { type: selectedType || 'audio/webm' });
                const extension = selectedType ? selectedType.split('/')[1].split(';')[0] : 'webm';
                const audioFile = new File([audioBlob], `recording-${Date.now()}.${extension}`, { type: audioBlob.type });
                setUploadedFile(audioFile);
                console.log("File generated:", audioFile.name, audioFile.size);
            };

            setMediaRecorder(recorder);
            recorder.start(1000); // Collect data every second for safety
            setIsRecording(true);
            setActiveTab('record');
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsRecording(false);
    };

    const handleTranscribe = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            // After transcription, we might want to stay in a "Result" state, 
            // but for now let's just show completion
            alert("Transcription complete!");
        }, 2000);
    };

    const handleReset = () => {
        handleStopRecording();
        setActiveTab(null);
        setYoutubeUrl('');
        setUploadedFile(null);
        setIsRecording(false);
        setIsProcessing(false);
        setRecordingTime(0);
    };

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [stream]);

    return (
        <div className="min-h-screen bg-[#f7f7f5] dark:bg-gray-900 flex flex-col items-center justify-center px-4">

            {/* Main Content */}
            {!activeTab ? (
                /* ─── Landing State ─── */
                <div className="flex flex-col items-center max-w-3xl w-full relative pt-12 md:pt-0">
                    {/* Back Button - Top Left for Mobile (Image 2) */}
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

                        {/* Start Recording - Full width on mobile */}
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
                    <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-6 text-center">Paste a YouTube video link to transcribe its audio.</p>

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
                            className={`px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-all shadow-sm ${youtubeUrl.trim() && !isProcessing
                                ? 'bg-[#4A90D9] text-white hover:bg-blue-600'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Transcribe'}
                        </button>
                    </div>

                    <button onClick={handleReset} className="mt-6 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-800 font-medium transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                        <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                </div>
            ) : activeTab === 'upload' ? (
                /* ─── Upload State ─── */
                <div className="flex flex-col items-center max-w-md w-full">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center mb-5">
                        <FileAudio className="w-6 h-6 text-[#4A90D9]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">File Uploaded</h2>

                    {uploadedFile && (
                        <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-xl p-4 mt-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileAudio className="w-5 h-5 text-[#4A90D9]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-medium text-gray-800 dark:text-gray-100 truncate">{uploadedFile.name}</p>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            <button onClick={handleReset} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleTranscribe}
                        disabled={isProcessing}
                        className="mt-8 px-8 py-3.5 w-full bg-[#4A90D9] text-white text-[15px] font-bold rounded-xl shadow-md hover:bg-blue-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
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
                        {/* Waveform Visualization Placeholder */}
                        <div className="h-24 flex items-center justify-center relative mb-4">
                            {/* The horizontal line */}
                            <div className="absolute inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex items-center justify-center">
                                {/* Dotted line overlay */}
                                <div className="absolute inset-0 border-t border-dotted border-blue-500 opacity-60"></div>
                            </div>

                            {/* The Center Marker Handle */}
                            <div className="w-[3px] h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)] z-10 transition-all duration-300 transform scale-y-110"></div>

                            {/* Subtle Pulse Rings */}
                            {isRecording && (
                                <div className="absolute w-12 h-12 rounded-full bg-blue-500/10 animate-ping"></div>
                            )}
                        </div>

                        {/* Control Bar */}
                        <div className="flex items-center justify-between px-4 sm:px-8 pb-2">
                            {/* Cancel Button */}
                            <button
                                onClick={handleReset}
                                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                                title="Cancel"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Status Text */}
                            <div className="flex flex-col items-center">
                                <span className="text-gray-800 dark:text-white font-medium tracking-wide text-[15px]">
                                    {isRecording ? 'Listening' : 'Recording Stopped'}
                                </span>
                                {isRecording && (
                                    <span className="text-gray-400 dark:text-gray-500 text-[11px] mt-1 font-mono uppercase tracking-[0.2em]">{formatTime(recordingTime)}</span>
                                )}
                            </div>

                            {/* Finish Button */}
                            <button
                                onClick={isRecording ? handleStopRecording : handleTranscribe}
                                className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-50/10 hover:bg-blue-100 dark:hover:bg-blue-50/20 border border-blue-100 dark:border-white/20 flex items-center justify-center text-blue-600 dark:text-white transition-all hover:scale-105 active:scale-95 shadow-lg group focus:outline-none"
                                title={isRecording ? "Stop Recording" : "Transcribe"}
                            >
                                {isProcessing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isRecording ? (
                                    <Check className="w-6 h-6 group-hover:text-blue-500 transition-colors" />
                                ) : (
                                    <Mic className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Footer Cancel/Back */}
                    {!isRecording && (
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
