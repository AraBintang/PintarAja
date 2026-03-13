import { BookOpen, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react'
import { memo } from 'react'

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

import WriterToolbar from './WriterToolbar'

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
}) {
  return (
    <>
      {/* Collapsible toggle */}
      {isGenerated && (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between px-5 py-3 mb-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-[13px] font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4A90D9]" />
            {inputCollapsed ? 'Tampilkan Input' : 'Sembunyikan Input'}
          </span>
          {inputCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      )}

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${inputCollapsed ? 'max-h-0 opacity-0 -translate-y-4' : 'max-h-[2000px] opacity-100 translate-y-0'}`}
      >
        {/* Topic */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[20px] md:rounded-[24px] shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4 md:mb-6">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <label className="text-[12px] md:text-[13px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Topik Penelitian
              </label>
              <button
                type="button"
                onClick={onPromptLibraryOpen}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] md:text-[12px] font-semibold rounded-lg md:rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Prompt Library
              </button>
            </div>
            <textarea
              value={topik}
              onChange={(e) => onTopikChange(e.target.value)}
              placeholder={
                'Masukkan topik penelitian dan kebutuhan Anda.\n\nContoh:\nTulis esai akademik tentang "Dampak Jangka Panjang Perubahan Iklim terhadap Ekosistem Laut."'
              }
              rows={5}
              className="w-full bg-transparent text-[14px] md:text-[15px] text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none resize-none leading-relaxed"
            />
            <div className="flex items-center justify-end mt-2">
              <span className="text-[11px] md:text-[12px] text-gray-400">
                {topik.length}/12,000
              </span>
            </div>
          </div>
        </div>

        {/* Paper, Section, Bahasa */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
            <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
              Jenis Karya
            </label>
            <Select value={selectedPaperId} onValueChange={onPaperChange}>
              <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <SelectValue placeholder="Pilih jenis" />
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
              Bagian Karya
            </label>
            <Select value={selectedSectionId} onValueChange={onSectionChange}>
              <SelectTrigger className="w-full h-10 md:h-11 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/50">
                <SelectValue placeholder="Pilih bagian" />
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
              Bahasa
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
                  <SelectLabel>Bahasa</SelectLabel>
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

        {/* Instruksi Tambahan */}
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[24px] p-4 md:p-6 mb-4 md:mb-6 shadow-sm hover:shadow-md transition-shadow">
          <label className="text-[11px] md:text-[12px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 md:mb-3 block">
            Instruksi Tambahan{' '}
            <span className="text-gray-400 dark:text-gray-500 normal-case font-normal">
              (opsional)
            </span>
          </label>
          <textarea
            value={instruksi}
            onChange={(e) => onInstruksiChange(e.target.value)}
            placeholder="Tambahkan instruksi khusus..."
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
                  <Loader2 className="w-5 h-5 animate-spin" /> Menghasilkan...
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
                  Generate Sekarang
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </>
  )
})

export default WriterForm
