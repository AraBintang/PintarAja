import { BookOpen, ChevronDown, ChevronUp, Loader2, Paperclip, Sparkles, X } from 'lucide-react'
import { memo, useState } from 'react'

import { LANGUAGES } from '@/assets/languages'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import FilePickerModal from './FilePickerModal'
import WriterToolbar from './WriterToolbar'

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ fileName, className = 'w-4 h-4' }) {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  const colorMap = {
    pdf: 'text-red-500',
    docx: 'text-blue-600',
    doc: 'text-blue-600',
    txt: 'text-gray-500',
    md: 'text-purple-500',
    pptx: 'text-orange-500',
  }
  return (
    <svg
      className={`${className} ${colorMap[ext] || 'text-gray-500'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

const WriterForm = memo(function WriterForm({
  // data
  papers,
  sections,
  aiProviders,
  // form values
  topik,
  instruksi,
  selectedPaperId,
  selectedSectionId,
  selectedAiId,
  bahasa,
  jumlah,
  panjang,
  // setters
  onTopikChange,
  onInstruksiChange,
  onPaperChange,
  onSectionChange,
  onAiChange,
  onBahasaChange,
  onJumlahChange,
  onPanjangChange,
  // ui
  isGenerated,
  isGenerating,
  inputCollapsed,
  onToggleCollapse,
  onGenerate,
  onPromptLibraryOpen,
  // file props — now array-based
  isGptProvider,
  selectedFiles,
  onFilesChange,
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleRemoveFile = (fileId) => {
    onFilesChange(selectedFiles.filter((f) => f.fileId !== fileId))
  }

  return (
    <>
      {/* Collapsible toggle */}
      {isGenerated && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between px-5 py-3 mt-4 mb-6 bg-white dark:bg-gray-800 border text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all border-gray-200 dark:border-gray-700 rounded-3xl text-[13px] font-semibold"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A90D9]" />
            {inputCollapsed ? 'Show Input' : 'Hide Input'}
          </span>
          {inputCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      )}

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          inputCollapsed
            ? 'max-h-0 opacity-0 -translate-y-4'
            : 'max-h-[2000px] opacity-100 translate-y-0'
        }`}
      >
        {/* Topic Card */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[20px] md:rounded-[24px] shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4 md:mb-6">
          <div className="p-4 md:p-6">
            {/* Header row */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <label className="text-[12px] md:text-[13px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Research Topics
              </label>

              {/* File picker button — only for GPT */}
              {isGptProvider && (
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] md:text-[12px] font-semibold rounded-lg md:rounded-xl border border-blue-200 bg-blue-50 text-[#2686D4] dark:text-[#60a5fa] hover:bg-blue-100 dark:border-blue-700/30 dark:bg-blue-900/10 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} Referensi`
                      : 'Tambah Referensi'}
                  </span>
                </button>
              )}
            </div>

            {/* Textarea */}
            <textarea
              value={topik}
              onChange={(e) => onTopikChange(e.target.value)}
              placeholder={
                'Enter your research topic and requirements.\n\nExample:\nWrite an academic essay on "Long-Term Impacts of Climate Change on Marine Ecosystems."'
              }
              rows={5}
              className="w-full bg-transparent text-[14px] md:text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
            />

            <div className="flex items-center justify-end mt-2">
              <span className="text-[11px] md:text-[12px] text-gray-400">
                {topik.length}/12,000
              </span>
            </div>

            {/* Selected files list */}
            {selectedFiles.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                {selectedFiles.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between gap-2 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-700/40 rounded-xl"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileTypeIcon fileName={file.fileName} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-blue-800 dark:text-blue-300 truncate max-w-[180px] md:max-w-[320px]">
                          {file.fileName}
                        </p>
                        <p className="text-[11px] text-blue-500 dark:text-blue-400 mt-0.5">
                          {formatFileSize(file.fileSize)}
                          <span className="ml-1.5 inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                            <span className="text-green-600 dark:text-green-400">Aktif</span>
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.fileId)}
                      disabled={isGenerating}
                      title="Hapus dari seleksi"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 dark:border-red-700/30 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 px-1 pt-1">
                  <X className="w-3 h-3 flex-shrink-0" />
                  Hapus file referensi sebelum berpindah ke halaman lain
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Paper, Section, Bahasa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Paper Type
            </label>
            <Select value={selectedPaperId} onValueChange={onPaperChange}>
              <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="py-2.5 pl-8 pr-3">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Paper Section
            </label>
            <Select value={selectedSectionId} onValueChange={onSectionChange}>
              <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectGroup>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="py-2.5 pl-8 pr-3">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Language
            </label>
            <Select value={bahasa} onValueChange={onBahasaChange}>
              <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <SelectValue placeholder="Pilih bahasa">
                  <div className="flex items-center gap-2">
                    <span
                      className={`${LANGUAGES.find((l) => l.text === bahasa)?.img || 'fi fi-id'} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {bahasa.split(' (')[0]}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] rounded-xl dark:bg-gray-800 dark:border-gray-700">
                <SelectGroup>
                  <SelectLabel>Language</SelectLabel>
                  {LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.text}
                      value={lang.text}
                      className="cursor-pointer py-2.5 pl-8 pr-3 hover:bg-blue-50 focus:bg-blue-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors rounded-lg mx-1 my-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`${lang.img} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
                        />
                        <span className="font-medium text-gray-700 dark:text-gray-200">
                          {lang.text.split(' (')[0]}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Additional Instructions */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[24px] p-4 md:p-6 mb-4 md:mb-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Additional Instructions{' '}
              <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">
                (optional)
              </span>
            </label>
            <button
              type="button"
              onClick={onPromptLibraryOpen}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] md:text-[12px] font-semibold rounded-lg md:rounded-xl border border-blue-200 bg-blue-50 text-[#2686D4] dark:text-[#F2901E] hover:bg-blue-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Prompt Library
            </button>
          </div>
          <textarea
            value={instruksi}
            onChange={(e) => onInstruksiChange(e.target.value)}
            placeholder="Add special instructions..."
            rows={2}
            className="w-full bg-transparent text-[13px] md:text-[14px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Toolbar */}
        <WriterToolbar
          aiProviders={aiProviders}
          selectedAiId={selectedAiId}
          onAiChange={onAiChange}
          jumlah={jumlah}
          onJumlahChange={onJumlahChange}
          panjang={panjang}
          onPanjangChange={onPanjangChange}
        />

        {/* Generate Button */}
        <div className="flex mb-6 px-1">
          <button
            onClick={onGenerate}
            disabled={isGenerating || !topik.trim() || !selectedAiId}
            className="relative group w-full py-3.5 md:py-4 text-white text-[14px] md:text-[15px] font-bold rounded-xl md:rounded-2xl shadow-md transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[#4A90D9] to-[#3A7BC8] hover:from-[#3f86cc] hover:to-[#2f6fb8] dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-400 dark:hover:to-orange-500"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                  Generate Now
                  {selectedFiles.length > 0 && (
                    <span className="ml-1 text-[12px] font-normal opacity-80">
                      · {selectedFiles.length} referensi
                    </span>
                  )}
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* File Picker Modal */}
      <FilePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedAiId={selectedAiId}
        selectedFiles={selectedFiles}
        onConfirm={onFilesChange}
      />
    </>
  )
})

export default WriterForm
