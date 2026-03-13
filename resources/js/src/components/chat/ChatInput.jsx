import { ArrowUp, FileText, Image, Paperclip, Plus, X as XIcon } from 'lucide-react'
import { useRef, useState } from 'react'

import { AI_CODE_MAP, AutoIcon } from './ChatConstants'

/* ─── ModelSelect ─── */
function ModelSelect({ value, onChange, aiProviders }) {
  const [open, setOpen] = useState(false)
  const selected = aiProviders.find((a) => String(a.id) === String(value))
  const mapped = selected
    ? (AI_CODE_MAP[selected.code] ?? { label: selected.code, icon: <AutoIcon /> })
    : { label: 'Pilih AI', icon: <AutoIcon /> }

  if (!aiProviders.length) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-[13px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
      >
        <span className="flex-shrink-0">{mapped.icon}</span>
        <span>{mapped.label}</span>
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
          strokeWidth="2"
          className="text-gray-400 flex-shrink-0"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-[70] min-w-[210px] py-2 overflow-hidden">
            <p className="text-[11px] font-bold text-gray-400 uppercase px-4 py-1.5 tracking-wider">
              Pilih Model AI
            </p>
            {aiProviders.map((ai) => {
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
                  className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                    isSelected
                      ? 'text-blue-500 font-bold bg-blue-50/50 dark:bg-blue-500/10'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="flex-shrink-0">{m.icon}</span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span>{m.label}</span>
                    {ai.model && (
                      <span className="text-[10px] text-gray-400 font-mono truncate">
                        {ai.model}
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              )
            })}
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
