import { FileText, Lock, Ruler } from 'lucide-react'
import { memo } from 'react'

import { AI_CODE_MAP, AutoIcon } from '@/assets/ai'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// memo agar tidak re-render saat parent update editorContent
const WriterToolbar = memo(function WriterToolbar({
  aiProviders,
  selectedAiId,
  onAiChange,
  jumlah,
  onJumlahChange,
  panjang,
  onPanjangChange,
}) {
  const selectedAi = aiProviders.find((a) => String(a.id) === selectedAiId)

  return (
    <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-white/50 dark:border-gray-700 rounded-[16px] md:rounded-[20px] p-3 md:p-5 mb-6 shadow-sm overflow-x-auto custom-scrollbar">
      <div className="flex items-center gap-2 md:gap-3 w-max min-w-full pb-1 md:pb-0">
        {/* AI Model */}
        <Select value={selectedAiId} onValueChange={onAiChange}>
          <SelectTrigger className="flex h-auto outline-none focus:ring-0 items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-gray-700 rounded-xl transition-all whitespace-nowrap shadow-sm [&>svg]:opacity-40 [&>svg]:ml-1.5">
            <SelectValue>
              {selectedAi && (
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0">
                    {AI_CODE_MAP[selectedAi.code]?.icon || <AutoIcon />}
                  </span>
                  <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
                    Model:
                  </span>
                  <span className="text-[13px] text-gray-800 dark:text-gray-200 font-semibold">
                    {AI_CODE_MAP[selectedAi.code]?.label || selectedAi.code}
                  </span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className="z-50 rounded-2xl min-w-[230px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-1.5"
            position="popper"
            side="top"
            sideOffset={8}
          >
            <SelectGroup>
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
                  const mapped = AI_CODE_MAP[ai.code] || { label: ai.code, icon: <AutoIcon /> }
                  const isSelected = String(ai.id) === selectedAiId
                  return (
                    <SelectItem
                      key={ai.id}
                      value={String(ai.id)}
                      className="cursor-pointer py-2.5 px-3 hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700/60 dark:focus:bg-gray-700/60 transition-colors rounded-xl my-0.5 [&>span:first-child]:hidden"
                    >
                      <div className="flex items-center gap-2.5 w-full">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#4A90D9]/10 dark:bg-[#4A90D9]/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          <span className="text-[15px]">{mapped.icon}</span>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className={`text-[13px] font-semibold leading-tight ${isSelected ? 'text-[#4A90D9]' : 'text-gray-700 dark:text-gray-200'}`}
                          >
                            {mapped.label}
                          </span>
                          {ai.model && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono truncate leading-tight mt-0.5">
                              {ai.model}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 ml-80 rounded-full bg-[#4A90D9] flex items-center justify-center flex-shrink-0">
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
                      </div>
                    </SelectItem>
                  )
                })
              )}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Jumlah Paragraf */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl whitespace-nowrap">
          <FileText className="w-3.5 h-3.5 text-[#2686D4] dark:text-[#F2901E] flex-shrink-0" />
          <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
            Paragraph:
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={jumlah}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (!isNaN(val) && val >= 1 && val <= 20) onJumlahChange(val)
            }}
            className="w-10 text-[13px] font-semibold text-gray-800 dark:text-gray-200 bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Maks Kata */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl whitespace-nowrap">
          <Ruler className="w-3.5 h-3.5 text-[#2686D4] dark:text-[#F2901E] flex-shrink-0" />
          <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
            Max Word:
          </span>
          <input
            type="number"
            min={0}
            max={10000}
            value={panjang}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (!isNaN(val) && val >= 0 && val <= 10000) onPanjangChange(val)
            }}
            className="w-14 text-[13px] font-semibold text-gray-800 dark:text-gray-200 bg-transparent outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  )
})

export default WriterToolbar
