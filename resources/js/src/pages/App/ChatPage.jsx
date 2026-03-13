import {
  ArrowUp,
  FileText,
  Hash,
  Image,
  Mic,
  Paperclip,
  Plus,
  Speech,
  X as XIcon,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

const AutoIcon = () => <Zap className="w-3.5 h-3.5 text-amber-500" />

const OpenAILogo = () => (
  <img src="/gpt-ai-icon.svg" alt="GPT" className="w-3.5 h-3.5 object-contain" />
)

const GeminiLogo = () => (
  <img src="/google-gemini-icon.svg" alt="Gemini" className="w-3.5 h-3.5 object-contain" />
)

const ClaudeLogo = () => (
  <img src="/claude-ai-icon.svg" alt="Claude" className="w-3.5 h-3.5 object-contain" />
)

const DeepSeekLogo = () => (
  <img src="/deepseek-ai-icon.svg" alt="DeepSeek" className="w-3.5 h-3.5 object-contain" />
)

const QwenLogo = () => (
  <img src="/qwen-ai-icon.svg" alt="Qwen" className="w-3.5 h-3.5 object-contain" />
)

const modelOptions = [
  { label: 'Auto', icon: <AutoIcon /> },
  { label: 'GPT-4o', icon: <OpenAILogo /> },
  { label: 'Gemini', icon: <GeminiLogo /> },
  { label: 'Claude', icon: <ClaudeLogo /> },
  { label: 'DeepSeek', icon: <DeepSeekLogo /> },
  { label: 'Qwen', icon: <QwenLogo /> },
]

const features = [
  {
    label: 'AI Writer',
    color: 'bg-white',
    iconColor: 'text-blue-500',
    to: '/writer',
    icon: <FileText />,
  },
  {
    label: 'Parafrase AI',
    color: 'bg-white',
    iconColor: 'text-green-500',
    to: '/paraphrase',
    icon: <Hash />,
  },
  {
    label: 'Humanizer AI',
    color: 'bg-white',
    iconColor: 'text-orange-500',
    to: '/humanize',
    icon: <Speech />,
  },
  {
    label: 'Transcribe AI',
    color: 'bg-white',
    iconColor: 'text-purple-500',
    to: '/transcribe',
    icon: <Mic />,
  },
]

/* ─── Model Select Component ─── */
function ModelSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = modelOptions.find((opt) => opt.label === value) || modelOptions[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
      >
        {selected.icon}
        <span>{selected.label}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-400"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[170px] py-2 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-2 origin-bottom-left duration-200 ease-out">
            <div className="text-[11px] font-bold text-gray-400 uppercase px-4 py-1.5 tracking-wider">
              Pilih Model AI
            </div>
            {modelOptions.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  onChange(opt.label)
                  setOpen(false)
                }}
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
  )
}

export default function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedModel, setSelectedModel] = useState('Auto')
  // const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState([])
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const messagesEndRef = useRef(null)
  const imageInputRef = useRef(null)
  const documentInputRef = useRef(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const isNewChat = location.pathname === '/new'

  useEffect(() => {
    if (isNewChat) {
      setMessages([])
      setAttachedFiles([])
      navigate('/chat', { replace: true })
    }

    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 200)
    return () => clearTimeout(timer)
  }, [isNewChat, navigate])

  useEffect(() => {
    const handleLoadHistory = (e) => {
      if (e.detail.id === 99) {
        // Clear current chat
        setMessages([])
        setIsLoadingHistory(true)

        setTimeout(() => {
          setMessages([
            {
              id: Date.now() - 2000,
              role: 'user',
              content: 'halo',
              model: selectedModel,
            },
            {
              id: Date.now() - 1000,
              role: 'assistant',
              content: 'Ini adalah simulasi respon dari **Auto** untuk pesan: "halo".',
              model: 'Auto',
            },
          ])
          setIsLoadingHistory(false)
        }, 800)
      }
    }

    window.addEventListener('loadHistoryChat', handleLoadHistory)
    return () => window.removeEventListener('loadHistoryChat', handleLoadHistory)
  }, [selectedModel])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e?.preventDefault()
    if (!inputValue.trim() && attachedFiles.length === 0) return

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      files: attachedFiles,
      model: selectedModel,
    }

    setMessages((prev) => [...prev, newUserMessage])
    setInputValue('')
    setAttachedFiles([])
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const fileCount = attachedFiles.length
      const aiResponse = {
        id: Date.now() + 1,
        role: 'assistant',
        model: selectedModel,
        content: `Ini adalah simulasi respon dari **${selectedModel}** untuk pesan: "${inputValue}". ${fileCount > 0 ? `Saya juga menerima ${fileCount} file pelengkap.` : ''}`,
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setAttachedFiles((prev) => {
        const combined = [...prev, ...files]
        if (combined.length > 3) {
          alert('Maksimal 3 file yang dapat diunggah.')
          return combined.slice(0, 3)
        }
        return combined
      })
    }
    e.target.value = '' // Reset input
  }

  const removeFile = (indexToRemove) => {
    setAttachedFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const textareaRef = useRef(null)

  const handleInput = (e) => {
    setInputValue(e.target.value)

    const el = textareaRef.current
    el.style.height = 'auto'

    const lineHeight = 24 // kira kira tinggi 1 baris
    const maxHeight = lineHeight * 13

    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }

  return (
    <div className="flex flex-col h-[100vh] bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4 shadow-inner">
        <div className="max-w-3xl mx-auto w-full space-y-8 pt-6 md:pt-0">
          {messages.length === 0 ? (
            /* Empty State or Loading */
            <div className="flex flex-col items-center justify-center min-h-[78vh] text-center w-full">
              {isLoading ? (
                <>
                  <div className="w-120 h-8 skeleton mx-auto opacity-80 mb-8" />
                  <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-14 skeleton-shimmer opacity-40" />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 tracking-tight">
                    Hi <span className="gradient-name">{user?.name}</span>, What can we help you
                    with today
                  </h1>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-6">
                    {features.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={`flex items-center gap-3 p-3 rounded-xl ${item.color} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all group`}
                      >
                        <span
                          className={`${item.iconColor} group-hover:scale-110 transition-transform`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200">
                          {item.label}
                        </span>
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
                <div
                  className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm break-all
                    ${
                      msg.role === 'user'
                        ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-tl-none'
                    }`}
                >
                  {msg.files && msg.files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[12px] font-medium truncate max-w-[150px]">
                            {file.name}
                          </span>
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
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Input Container */}
      <div className="sticky bottom-0 pt-2 bg-[#f7f7f5] dark:bg-[#0f141e] px-4 transition-all duration-300">
        <form
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto w-full bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm"
        >
          <div className="flex flex-col">
            {attachedFiles.length > 0 && (
              <div className="px-5 pt-3 flex items-center gap-2 flex-wrap">
                {attachedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[13px] font-medium border border-blue-100 dark:border-blue-800"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Ask anything"
              className="w-full px-5 my-4 text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none bg-transparent resize-none min-h-[35px] max-h-[312px]"
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
                  className="w-9 h-9 rounded-full border bg-[#eeedeb] dark:bg-black/20 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors relative z-30 flex-shrink-0"
                  title="Lampirkan file"
                >
                  <Plus
                    className={`w-4 h-4 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`}
                  />
                </button>

                {/* Attachment Menu */}
                {showAttachMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowAttachMenu(false)} />
                    <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 py-2 w-48 animate-in fade-in slide-in-from-bottom-2">
                      <button
                        type="button"
                        onClick={() => {
                          imageInputRef.current?.click()
                          setShowAttachMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <Image className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold leading-tight">Gambar</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            JPG, PNG, GIF
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          documentInputRef.current?.click()
                          setShowAttachMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold leading-tight">Dokumen</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            PDF, DOC, TXT
                          </p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
                <div className="flex items-center ml-1 bg-[#eeedeb] dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-full">
                  {/* <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[13px] font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    <Search className="w-3.5 h-3.5 opacity-80" />
                    Deep Research
                  </button> */}
                  <ModelSelect value={selectedModel} onChange={setSelectedModel} />
                </div>
              </div>
              <div className="flex items-center gap-3 pr-1">
                {/* <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
                <button
                  type="button"
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex items-center justify-center transition-all ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                  title="Input suara"
                >
                  <Mic className="w-[18px] h-[18px]" />
                </button> */}
                <button
                  type="submit"
                  disabled={!inputValue.trim() && attachedFiles.length === 0}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${inputValue.trim() || attachedFiles.length > 0 ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105' : 'bg-[#eeedeb] dark:bg-black/20 text-gray-400 dark:text-[#555]'}`}
                >
                  <ArrowUp className="w-[18px] h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="max-w-3xl mx-auto my-2 text-center px-4">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Pintaraja dapat membuat kesalahan. Harap cek kembali informasi yang didapat.
          </p>
        </div>
      </div>
    </div>
  )
}
