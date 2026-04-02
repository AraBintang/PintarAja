import { ArrowUp, FileText, Image, Lock, Plus, X as XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { AI_CODE_MAP, AI_MODELS, AutoIcon } from '@/assets/ai'

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
        <span className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[90px]">
          {mapped.label}
        </span>
        {selected?.model && (
          <span className="text-[12px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[110px]">
            {selected.model}
          </span>
        )}
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
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[220px] max-w-[300px] p-1.5 overflow-hidden">
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
                          {ai.model && (
                            <span
                              className={`text-[13px] font-semibold truncate ${isSelected ? 'text-[#4A90D9]' : 'text-gray-700 dark:text-gray-200'}`}
                            >
                              {ai.model}
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
          </div>
        </>
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
  const canAttachImage = !isStreaming && selectedProvider?.code !== 'SETTING-DSK'
  const canAttachFile = !isStreaming && selectedProvider?.code === 'SETTING-GPT'

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
          className="w-full bg-white -mt-8 dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm"
        >
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
                  <>
                    <div className="fixed inset-0 z-10" onClick={onToggleAttachMenu} />
                    <div className="absolute bottom-full mb-2 p-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 w-48">
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
                    </div>
                  </>
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
