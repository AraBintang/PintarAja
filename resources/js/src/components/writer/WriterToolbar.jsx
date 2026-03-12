import { FileText, Ruler } from 'lucide-react'
import { memo } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AI_CODE_MAP, AutoIcon } from './WriterConstants'

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
          <SelectTrigger className="flex h-auto outline-none focus:ring-0 items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition-all whitespace-nowrap [&>svg]:opacity-50 [&>svg]:ml-1">
            <SelectValue>
              {selectedAi && (
                <div className="flex items-center gap-1.5">
                  <span className="flex-shrink-0">
                    {AI_CODE_MAP[selectedAi.code]?.icon || <AutoIcon />}
                  </span>
                  <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
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
            className="z-50 rounded-xl min-w-[220px] border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl"
            position="popper"
            side="top"
            sideOffset={8}
          >
            <SelectGroup>
              {aiProviders.map((ai) => {
                const mapped = AI_CODE_MAP[ai.code] || { label: ai.code, icon: <AutoIcon /> }
                return (
                  <SelectItem
                    key={ai.id}
                    value={String(ai.id)}
                    className="cursor-pointer py-2.5 pl-8 pr-3 hover:bg-gray-50 focus:bg-gray-50 dark:hover:bg-gray-700 dark:focus:bg-gray-700 transition-colors rounded-lg mx-1 my-0.5"
                  >
                    <div className="flex items-center gap-2 text-[13px]">
                      <span>{mapped.icon}</span>
                      <div className="flex flex-col">
                        <span
                          className={
                            String(ai.id) === selectedAiId
                              ? 'text-[#4A90D9] font-semibold'
                              : 'text-gray-600 dark:text-gray-300'
                          }
                        >
                          {mapped.label}
                        </span>
                        {ai.model && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            {ai.model}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Jumlah Paragraf */}
        <div className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl whitespace-nowrap">
          <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
            Paragraf:
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
          <Ruler className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          <span className="text-[13px] text-gray-400 dark:text-gray-500 font-medium">
            Maks kata:
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
