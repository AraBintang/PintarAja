import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Send, Plus, Search, Mic, ArrowUp, Paperclip, X as XIcon, Loader2, Zap, Image, FileText, Hash, Activity } from 'lucide-react';

/* ─── AI Model Logo SVGs (Reused from AIWriterPage) ─── */
const AutoIcon = () => <Zap className="w-3.5 h-3.5 text-amber-500" />;
const OpenAILogo = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.79a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.666zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
);
const GeminiLogo = () => <img src="/google-gemini-icon.svg" alt="Gemini" className="w-3.5 h-3.5 object-contain" />;
const ClaudeLogo = () => <img src="/claude-ai-icon.svg" alt="Claude" className="w-3.5 h-3.5 object-contain" />;
const DeepSeekLogo = () => <img src="/deepseek-color.svg" alt="DeepSeek" className="w-3.5 h-3.5 object-contain" />;

/* ─── Sidebar Matched Icons ─── */
const DocsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 7h8M8 12h8M8 17h4" />
    </svg>
);

const AssistantIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

const QuestionIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
    </svg>
);

const MicIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const modelOptions = [
    { label: 'Auto', icon: <AutoIcon /> },
    { label: 'GPT-4o', icon: <OpenAILogo /> },
    { label: 'Gemini', icon: <GeminiLogo /> },
    { label: 'Claude', icon: <ClaudeLogo /> },
    { label: 'DeepSeek', icon: <DeepSeekLogo /> },
];

/* ─── Model Select Component ─── */
function ModelSelect({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const selected = modelOptions.find(opt => opt.label === value) || modelOptions[0];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
            >
                <span>{selected.label}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[170px] py-2 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 origin-bottom-left duration-200 ease-out">
                        <div className="text-[11px] font-bold text-gray-400 uppercase px-4 py-1.5 tracking-wider">Pilih Model AI</div>
                        {modelOptions.map((opt) => (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => { onChange(opt.label); setOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${value === opt.label ? 'text-blue-500 font-bold bg-blue-50/50 dark:bg-blue-500/10' : 'text-gray-600 dark:text-gray-300'}`}
                            >
                                <span className="flex-shrink-0">{opt.icon}</span>
                                <span>{opt.label}</span>
                                {value === opt.label && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Auto');
    const [isRecording, setIsRecording] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const messagesEndRef = useRef(null);
    const imageInputRef = useRef(null);
    const documentInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const isNewChat = location.pathname === '/app/new';

    // Handle "New Chat" logic and initial loading simulation
    useEffect(() => {
        if (isNewChat) {
            setMessages([]);
            setAttachedFiles([]);
            navigate('/app/chat', { replace: true });
        }

        // Simulate initial loading
        const timer = setTimeout(() => setIsLoading(false), 900);
        return () => clearTimeout(timer);
    }, [isNewChat, navigate]);

    // Listen for history item click from RightSidebar
    useEffect(() => {
        const handleLoadHistory = (e) => {
            if (e.detail.id === 99) {
                // Clear current chat
                setMessages([]);
                setIsLoadingHistory(true);

                // Simulate network latency (800ms) before showing messages
                setTimeout(() => {
                    setMessages([
                        {
                            id: Date.now() - 2000,
                            role: 'user',
                            content: 'halo',
                            model: selectedModel
                        },
                        {
                            id: Date.now() - 1000,
                            role: 'assistant',
                            content: 'Ini adalah simulasi respon dari **Auto** untuk pesan: "halo".',
                            model: 'Auto'
                        }
                    ]);
                    setIsLoadingHistory(false);
                }, 800);
            }
        };

        window.addEventListener('loadHistoryChat', handleLoadHistory);
        return () => window.removeEventListener('loadHistoryChat', handleLoadHistory);
    }, [selectedModel]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputValue.trim() && attachedFiles.length === 0) return;

        const newUserMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            files: attachedFiles,
            model: selectedModel
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInputValue('');
        setAttachedFiles([]);
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const fileCount = attachedFiles.length;
            const aiResponse = {
                id: Date.now() + 1,
                role: 'assistant',
                model: selectedModel,
                content: `Ini adalah simulasi respon dari **${selectedModel}** untuk pesan: "${inputValue}". ${fileCount > 0 ? `Saya juga menerima ${fileCount} file pelengkap.` : ''}`,
            };
            setMessages((prev) => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setAttachedFiles(prev => {
                const combined = [...prev, ...files];
                if (combined.length > 3) {
                    alert('Maksimal 3 file yang dapat diunggah.');
                    return combined.slice(0, 3);
                }
                return combined;
            });
        }
        e.target.value = ''; // Reset input
    };

    const removeFile = (indexToRemove) => {
        setAttachedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="flex flex-col h-[calc(100vh-48px)] bg-[#f7f7f5] dark:bg-gray-900 transition-colors duration-300">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto pt-4 md:pt-8 pb-32 px-4 shadow-inner">
                <div className="max-w-3xl mx-auto w-full space-y-8 pt-6 md:pt-0">
                    {messages.length === 0 ? (
                        /* Empty State or Loading */
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full">
                            {isLoading ? (
                                <>
                                    <div className="w-64 h-8 skeleton mb-8 mx-auto opacity-80" />
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="h-20 skeleton-shimmer opacity-40" />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 tracking-tight">
                                        Hi Adi, What can Supa help you with today
                                    </h1>

                                    <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-4">
                                        {[
                                            {
                                                label: 'AI Writer', color: 'bg-white', iconColor: 'text-blue-500',
                                                to: '/app/docs',
                                                icon: <DocsIcon />
                                            },
                                            {
                                                label: 'Parafrase AI', color: 'bg-white', iconColor: 'text-green-500',
                                                to: '/app/tanya',
                                                icon: <QuestionIcon />
                                            },
                                            {
                                                label: 'Humanizer AI', color: 'bg-white', iconColor: 'text-orange-500',
                                                to: '/app/asisten',
                                                icon: <AssistantIcon />
                                            },
                                            {
                                                label: 'Transcribe AI', color: 'bg-white', iconColor: 'text-purple-500',
                                                to: '/app/transkripsi',
                                                icon: <MicIcon />
                                            },
                                        ].map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.to}
                                                className={`flex items-center gap-3 p-4 rounded-xl ${item.color} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all group`}
                                            >
                                                <span className={`${item.iconColor} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                                                <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200">{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : isLoadingHistory ? (
                        /* Skeleton Loading State for History Messages */
                        <div className="space-y-6">
                            {/* User Message Skeleton */}
                            <div className="flex flex-col w-full items-end">
                                <div className="max-w-[85%] md:max-w-[75%] px-4 py-4 rounded-2xl rounded-tr-none bg-[#eeedeb] dark:bg-gray-800 shadow-sm">
                                    <div className="w-24 h-4 skeleton opacity-60"></div>
                                </div>
                            </div>

                            {/* AI Message Skeleton */}
                            <div className="flex flex-col w-full items-start">
                                <div className="max-w-[85%] md:max-w-[75%] px-4 py-4 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm w-full">
                                    <div className="space-y-3">
                                        <div className="w-3/4 h-4 skeleton opacity-50"></div>
                                        <div className="w-full h-4 skeleton opacity-30"></div>
                                        <div className="w-5/6 h-4 skeleton opacity-30"></div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <div className="w-16 h-3 skeleton opacity-40"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Conversation History */
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm
                                    ${msg.role === 'user'
                                        ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                    }`}
                                >
                                    {msg.files && msg.files.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {msg.files.map((file, idx) => (
                                                <div key={idx} className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50">
                                                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="text-[12px] font-medium truncate max-w-[150px]">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {msg.content}
                                    {msg.role === 'assistant' && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1.5 opacity-50 text-[11px]">
                                            <span className="font-semibold">{msg.model}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex items-start">
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                                <span className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Sticky Input Container */}
            <div className="fixed bottom-0 left-0 right-0 md:left-[260px] pb-6 pt-2 bg-gradient-to-t from-[#f7f7f5] via-[#f7f7f5] to-transparent dark:from-gray-900 dark:via-gray-900 px-4 transition-all duration-300">
                <form
                    onSubmit={handleSendMessage}
                    className="max-w-3xl mx-auto w-full bg-[#f4f4f4] dark:bg-[#212121] rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm"
                >
                    <div className="flex flex-col">
                        {attachedFiles.length > 0 && (
                            <div className="px-5 pt-3 flex items-center gap-2 flex-wrap">
                                {attachedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[13px] font-medium border border-blue-100 dark:border-blue-800">
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(idx)} className="hover:text-blue-800 dark:hover:text-blue-200">
                                            <XIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <textarea
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask anything to Supa"
                            className="w-full px-5 pt-4 pb-1 text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none bg-transparent resize-none min-h-[45px] max-h-48"
                        />
                        <div className="flex items-center justify-between px-3 pb-3">
                            <div className="flex items-center gap-1 relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    ref={imageInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt"
                                    ref={documentInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                                    className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors relative z-30 flex-shrink-0"
                                    title="Lampirkan file"
                                >
                                    <Plus className={`w-4 h-4 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`} />
                                </button>

                                {/* Attachment Menu */}
                                {showAttachMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 py-2 w-48 animate-in fade-in slide-in-from-bottom-2">
                                            <button
                                                type="button"
                                                onClick={() => { imageInputRef.current?.click(); setShowAttachMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                    <Image className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold leading-tight">Gambar</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG, GIF</p>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { documentInputRef.current?.click(); setShowAttachMenu(false); }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    <FileText className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold leading-tight">Dokumen</p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">PDF, DOC, TXT</p>
                                                </div>
                                            </button>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center gap-1.5 ml-1 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-full pl-1.5 pr-2 py-0.5">
                                    <button type="button" className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        <Search className="w-3.5 h-3.5 opacity-80" />
                                        Deep Research
                                    </button>
                                    <ModelSelect value={selectedModel} onChange={setSelectedModel} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pr-1">
                                <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
                                <button
                                    type="button"
                                    onClick={() => setIsRecording(!isRecording)}
                                    className={`flex items-center justify-center transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                                    title="Input suara"
                                >
                                    <Mic className="w-[18px] h-[18px]" />
                                </button>
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() && attachedFiles.length === 0}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${inputValue.trim() || attachedFiles.length > 0 ? 'bg-black dark:bg-[#444] text-white dark:text-gray-200 hover:scale-105' : 'bg-[#e0e0e0] dark:bg-[#2a2a2a] text-gray-400 dark:text-[#555]'}`}
                                >
                                    <ArrowUp className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="max-w-3xl mx-auto mt-2 text-center px-4">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        Pintaraja dapat membuat kesalahan. Periksa info penting.
                    </p>
                </div>
            </div>
        </div>
    );
}
