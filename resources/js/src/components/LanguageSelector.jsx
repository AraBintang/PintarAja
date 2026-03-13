import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LANGUAGES } from '@/data/languages'

export default function LanguageSelector({ selectedLang, onLangChange }) {
  return (
    <Select value={selectedLang} onValueChange={onLangChange}>
      <SelectTrigger className="w-[180px] h-10 bg-white dark:bg-[#252b3b] border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 dark:focus:ring-orange-500 text-[14px] shadow-sm rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a3142] transition-colors">
        <SelectValue placeholder="Pilih Bahasa">
          <div className="flex items-center gap-2">
            <span
              className={`${LANGUAGES.find((l) => l.text === selectedLang)?.img || 'fi fi-id'} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
            />
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {selectedLang.split(' (')[0]}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[350px] z-50 rounded-xl shadow-xl dark:bg-[#1e2330] dark:border-gray-700">
        <SelectGroup>
          <SelectLabel>Bahasa</SelectLabel>
          {LANGUAGES.map((lang) => (
            <SelectItem
              key={lang.text}
              value={lang.text}
              className="cursor-pointer py-2.5 px-3 hover:bg-blue-50 focus:bg-blue-50 dark:hover:bg-[#252b3b] dark:focus:bg-[#252b3b] transition-colors rounded-lg mx-1 my-0.5"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`${lang.img} rounded-[2px] w-[22px] h-[16px] shadow-[0_0_2px_rgba(0,0,0,0.4)] block bg-cover bg-center`}
                />
                <span className="font-medium text-gray-700 dark:text-gray-200">
                  {lang.text.split(' (')[0]}
                </span>
                <span className="text-gray-400 dark:text-gray-500 text-[11px] ml-auto hidden sm:inline-block">
                  {lang.text.includes('(') ? lang.text.split('(')[1].replace(')', '') : ''}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
