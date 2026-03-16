import { ArrowUp, FileText, Image, Lock, Paperclip, Plus, X as XIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { AI_CODE_MAP, AutoIcon } from './ChatConstants'

/* ─── ModelSelect ─── */
function ModelSelect({ value, onChange, aiProviders }) {
  const [open, setOpen] = useState(false)
  const selected = aiProviders.find((a) => String(a.id) === String(value))
  const mapped = selected
    ? (AI_CODE_MAP[selected.code] ?? { label: selected.code, icon: <AutoIcon /> })
    : { label: 'Select AI', icon: <AutoIcon /> }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 rounded-xl text-[13px] transition-all shadow-sm whitespace-nowrap"
      >
        <span className="flex-shrink-0">{mapped.icon}</span>
        <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">Model:</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{mapped.label}</span>
        {selected?.model && (
          <span className="text-[10px] text-gray-400 font-mono hidden sm:inline truncate max-w-[90px]">
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

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[230px] p-1.5 overflow-hidden">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase px-3 pt-2 pb-1.5 tracking-widest">
              Select AI Model
            </p>
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
                const isSelected = String(ai.id) === String(value)
                return (
                  <button
                    key={ai.id}
                    type="button"
                    onClick={() => {
                      onChange(String(ai.id))
                      setOpen(false)
                    }}
                    className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-center gap-2.5 my-0.5 ${
                      isSelected
                        ? 'bg-[#4A90D9]/8 dark:bg-[#4A90D9]/15'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#4A90D9]/10 dark:bg-[#4A90D9]/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                    >
                      <span className="text-[15px]">{m.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className={`text-[13px] font-semibold leading-tight ${isSelected ? 'text-[#4A90D9]' : 'text-gray-700 dark:text-gray-200'}`}
                      >
                        {m.label}
                      </span>
                      {ai.model && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate leading-tight mt-0.5">
                          {ai.model}
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
        </>
      )}
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
}) {
  const textareaRef = useRef(null)
  const imageRef = useRef(null)
  const docRef = useRef(null)

  const handleInput = (e) => {
    onInputChange(e.target.value)
    const el = textareaRef.current
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 24 * 13) + 'px'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const handleFileChange = (e) => {
    onFileChange(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  return (
    <div className="sticky bottom-0 pt-2 bg-[#f7f7f5] dark:bg-[#0f141e] px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="max-w-3xl mx-auto w-full bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50 shadow-sm"
      >
        <div className="flex flex-col">
          {/* File chips */}
          {attachedFiles.length > 0 && (
            <div className="px-5 pt-3 flex items-center gap-2 flex-wrap">
              {attachedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[13px] font-medium border border-blue-100 dark:border-blue-800"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{f.name}</span>
                  <button type="button" onClick={() => onRemoveFile(i)}>
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
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="w-full px-5 my-4 text-[15px] text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none bg-transparent resize-none min-h-[35px] max-h-[312px]"
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

              {/* Attach button */}
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
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 py-2 w-48">
                    <button
                      type="button"
                      onClick={() => {
                        imageRef.current?.click()
                        onToggleAttachMenu()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shrink-0">
                        <Image className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold leading-tight">Gambar</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG, GIF</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        docRef.current?.click()
                        onToggleAttachMenu()
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold leading-tight">Dokumen</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">PDF, DOC, TXT</p>
                      </div>
                    </button>
                  </div>
                </>
              )}

              <div className="flex items-center ml-1 bg-[#eeedeb] dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-full">
                <ModelSelect value={selectedAiId} onChange={onAiChange} aiProviders={aiProviders} />
              </div>
            </div>

            <div className="pr-1">
              <button
                type="submit"
                disabled={!canSend}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  canSend
                    ? 'bg-black dark:bg-white text-white dark:text-black hover:scale-105'
                    : 'bg-[#eeedeb] dark:bg-black/20 text-gray-400 dark:text-[#555]'
                }`}
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
  )
}
