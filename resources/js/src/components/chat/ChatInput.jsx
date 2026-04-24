import { ArrowUp, FileText, Image, Lock, Plus, X as XIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { AI_CODE_MAP, AI_MODELS, AutoIcon } from '@/assets/ai'

/* ─── Toast Notification ─── */
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-[13px] font-medium rounded-2xl shadow-xl whitespace-nowrap">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {message}
      </div>
    </motion.div>
  )
}

/* ─── ModelSelect ─── */
function ModelSelect({ value, onChange, aiProviders, disabled }) {
  const [open, setOpen] = useState(false)
  const selected = aiProviders.find((a) => String(a.id) === String(value))
  const mapped = selected
    ? (AI_CODE_MAP[selected.code] ?? { label: selected.code, icon: <AutoIcon /> })
    : { label: 'Select AI', icon: <AutoIcon /> }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-full text-[13px] transition-all shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex-shrink-0">{mapped.icon}</span>
        {selected?.model &&
          (() => {
            const modelInfo = (AI_MODELS[selected.code] ?? []).find(
              (item) => item.value === selected?.model || item.label === selected?.model,
            )

            return (
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                {modelInfo?.label || selected?.model}
              </span>
            )
          })()}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-gray-400 flex-shrink-0 ml-0.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && !disabled && (
        <AnimatePresence>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[220px] max-w-[300px] p-1.5 overflow-hidden"
          >
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase px-3 pt-2 pb-1.5 tracking-widest">
              Select AI Model
            </p>
            <div className="max-h-[320px] overflow-y-auto px-0.5 pb-1">
              {aiProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <span className="text-2xl mb-2">
                    <Lock />
                  </span>
                  <p className="text-[13px] font-semibold text-gray-500 dark:text-gray-400">
                    No models available
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Upgrade your plan to unlock AI models
                  </p>
                </div>
              ) : (
                aiProviders.map((ai) => {
                  const m = AI_CODE_MAP[ai.code] ?? { label: ai.code, icon: <AutoIcon /> }
                  const modelInfo = (AI_MODELS[ai.code] ?? []).find(
                    (item) => item.value === ai.model || item.label === ai.model,
                  )
                  const isSelected = String(ai.id) === String(value)
                  return (
                    <button
                      key={ai.id}
                      type="button"
                      onClick={() => {
                        onChange(String(ai.id))
                        setOpen(false)
                      }}
                      className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 my-0.5 ${isSelected ? 'bg-[#4A90D9]/8 dark:bg-[#4A90D9]/15' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#4A90D9]/8 dark:bg-[#4A90D9]/15' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'}`}
                      >
                        <span className="text-[15px]">{m.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {modelInfo?.label && (
                            <span
                              className={`text-[13px] font-semibold truncate ${isSelected ? 'text-[#4A90D9]' : 'text-gray-700 dark:text-gray-200'}`}
                            >
                              {modelInfo?.label}
                            </span>
                          )}
                        </div>
                        {modelInfo?.desc && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate">
                            {modelInfo.desc}
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#4A90D9] flex items-center justify-center flex-shrink-0">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin w-[18px] h-[18px]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  )
}

function FileChip({ file, index, onRemove, isStreaming }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  const isImage = file.type.startsWith('image/')

  useEffect(() => {
    if (!isImage) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, isImage])

  const ext = file.name.split('.').pop().toUpperCase()
  const extColorMap = {
    PDF: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
    DOC: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
    DOCX: 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400',
    TXT: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  }
  const extColor = extColorMap[ext] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500'

  if (isImage && previewUrl) {
    return (
      <div className="relative group shrink-0">
        <img
          src={previewUrl}
          alt={file.name}
          className="w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-gray-600"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={isStreaming}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
        >
          <XIcon className="w-3 h-3" />
        </button>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none max-w-[120px] truncate">
          {file.name}
        </div>
      </div>
    )
  }

  return (
    <div className="relative group flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl shrink-0 max-w-[200px]">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${extColor}`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 truncate">
          {file.name}
        </span>
        <span className={`text-[10px] font-bold ${extColor.split(' ')[2] ?? 'text-gray-400'}`}>
          {ext}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        disabled={isStreaming}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  )
}

/* ─── Helper: detect if pasted text looks like code ─── */
function detectCode(text) {
  const lines = text.split('\n')
  if (lines.length < 2) return false

  const codePatterns = [
    /^\s*(import|export|from|require)\s+/m,
    /^\s*(function|const|let|var|class|def|return|if|for|while|switch)\s+/m,
    /[{};]\s*$/m,
    /^\s*(\/\/|#|\/\*|\*).+/m,
    /=>\s*[{(]/,
    /\(\s*\)\s*\{/,
    /<\/?[a-zA-Z][a-zA-Z0-9]*(\s|\/?>)/,
    /^\s*(public|private|protected|static|async|await)\s+/m,
    /^\s*@[a-zA-Z]/m,
  ]
  return codePatterns.some((p) => p.test(text))
}

function guessLang(text) {
  if (/^\s*</.test(text) && /<\//.test(text)) return 'html'
  if (/import React|\.jsx|\.tsx/.test(text)) return 'tsx'
  if (/def |import |print\(/.test(text)) return 'python'
  if (/SELECT|INSERT|UPDATE|DELETE/i.test(text) && !/function|const/.test(text)) return 'sql'
  if (/\$[a-zA-Z]|echo |<\?php/.test(text)) return 'php'
  if (/interface |: string|: number|: boolean/.test(text)) return 'typescript'
  return 'javascript'
}

export default function ChatInput({
  inputValue,
  onInputChange,
  attachedFiles,
  onRemoveFile,
  showAttachMenu,
  onToggleAttachMenu,
  onFileChange,
  aiProviders,
  selectedAiId,
  onAiChange,
  canSend,
  onSubmit,
  isStreaming,
}) {
  const textareaRef = useRef(null)
  const imageRef = useRef(null)
  const docRef = useRef(null)
  const [toast, setToast] = useState(null)

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = inputValue ? Math.min(el.scrollHeight, 24 * 13) + 'px' : ''
  }, [inputValue])

  const handleInput = (e) => {
    onInputChange(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 24 * 13) + 'px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isStreaming) onSubmit()
    }
  }

  const handleFileChange = (e) => {
    onFileChange(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  const selectedProvider = aiProviders.find((a) => String(a.id) === String(selectedAiId))
  const isDeepseek = selectedProvider?.code === 'SETTING-DSK'
  const canAttachImage = !isStreaming && !isDeepseek
  const canAttachFile = !isStreaming && selectedProvider?.code === 'SETTING-GPT'

  /* ─── Paste handler ─── */
  const handlePaste = (e) => {
    if (isStreaming) return

    const items = Array.from(e.clipboardData?.items ?? [])

    // 1. Paste image from clipboard
    const imageItem = items.find((item) => item.type.startsWith('image/'))
    if (imageItem) {
      e.preventDefault()
      if (isDeepseek) {
        setToast('Model ini tidak support image vision')
        return
      }
      const file = imageItem.getAsFile()
      if (file) {
        const ext = file.type.split('/')[1] || 'png'
        const named = new File([file], `paste-${Date.now()}.${ext}`, { type: file.type })
        onFileChange([named])
      }
      return
    }

    // 2. Paste code — detect and auto-wrap in markdown code block
    const textItem = items.find((item) => item.type === 'text/plain')
    if (textItem) {
      textItem.getAsString((text) => {
        if (detectCode(text)) {
          e.preventDefault()
          const lang = guessLang(text)
          const block = `\`\`\`${lang}\n${text}\n\`\`\``

          const el = textareaRef.current
          const start = el.selectionStart
          const end = el.selectionEnd
          const next = inputValue.slice(0, start) + block + inputValue.slice(end)
          onInputChange(next)

          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + block.length
            el.focus()
          })
        }
        // else: let default paste happen normally (don't call preventDefault)
      })
    }
  }

  return (
    <div
      className="fixed bottom-0 right-0 transition-all duration-300 ease-in-out"
      style={{ left: isMobile ? '10px' : 'var(--sidebar-w, 64px)', right: isMobile ? '10px' : '' }}
    >
      <div className="max-w-3xl md:mx-auto w-full bg-[#f7f7f5] dark:bg-[#0f141e] rounded-t-4xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!isStreaming) onSubmit()
          }}
          className="w-full bg-white -mt-8 dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm relative"
        >
          {/* Toast */}
          {toast && <Toast message={toast} onClose={() => setToast(null)} />}

          <div className="flex flex-col">
            {attachedFiles.length > 0 && (
              <div className="px-4 pt-4 flex items-end gap-2 flex-wrap">
                {attachedFiles.map((f, i) => (
                  <FileChip
                    key={i}
                    file={f}
                    index={i}
                    onRemove={onRemoveFile}
                    isStreaming={isStreaming}
                  />
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              disabled={isStreaming}
              placeholder={isStreaming ? 'AI is answering...' : 'Ask anything'}
              className="w-full px-5 my-4 text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none bg-transparent resize-none min-h-[35px] max-h-[312px] disabled:cursor-not-allowed transition-colors"
            />

            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1 relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={imageRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                  ref={docRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={onToggleAttachMenu}
                  className="w-9 h-9 rounded-full border bg-[#eeedeb] dark:bg-black/20 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-colors relative z-30 flex-shrink-0"
                >
                  <Plus
                    className={`w-4 h-4 transition-transform ${showAttachMenu ? 'rotate-45' : ''}`}
                  />
                </button>

                {showAttachMenu && (
                  <AnimatePresence>
                    <div className="fixed inset-0 z-10" onClick={onToggleAttachMenu} />
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 10 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="absolute bottom-full mb-2 p-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 w-48"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (!canAttachImage) return
                          imageRef.current?.click()
                          onToggleAttachMenu()
                        }}
                        disabled={!canAttachImage}
                        title={
                          !canAttachImage
                            ? 'Upload gambar tidak tersedia untuk model Deepseek'
                            : undefined
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] rounded-xl transition-colors ${!canAttachImage ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!canAttachImage ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'}`}
                        >
                          <Image className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-semibold leading-tight ${!canAttachImage ? 'text-gray-400 dark:text-gray-500' : ''}`}
                          >
                            Image
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, GIF</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!canAttachFile) return
                          docRef.current?.click()
                          onToggleAttachMenu()
                        }}
                        disabled={!canAttachFile}
                        title={
                          !canAttachFile
                            ? 'Upload file hanya tersedia untuk model OpenAI (GPT)'
                            : undefined
                        }
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[14px] rounded-xl transition-colors ${!canAttachFile ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/60 cursor-pointer'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!canAttachFile ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-semibold leading-tight ${!canAttachFile ? 'text-gray-400 dark:text-gray-500' : ''}`}
                          >
                            File
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">PDF, DOC, TXT</p>
                        </div>
                      </button>
                    </motion.div>
                  </AnimatePresence>
                )}

                <div className="flex items-center ml-1 bg-[#eeedeb] dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-full">
                  <ModelSelect
                    value={selectedAiId}
                    onChange={onAiChange}
                    aiProviders={aiProviders}
                    disabled={isStreaming}
                  />
                </div>
              </div>

              <div className="pr-1">
                <button
                  type="submit"
                  disabled={!canSend}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isStreaming ? 'bg-black dark:bg-white text-white dark:text-black cursor-not-allowed' : canSend ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105' : 'bg-[#eeedeb] dark:bg-black/20 text-gray-400 dark:text-[#555]'}`}
                >
                  {isStreaming ? <Spinner /> : <ArrowUp className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="py-2 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Pintaraja dapat membuat kesalahan. Harap cek kembali informasi yang didapat.
          </p>
        </div>
      </div>
    </div>
  )
}
