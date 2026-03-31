import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const WEB_SETTING_KEYS = [
  { key: 'whatsapp_number', label: 'Nomor WhatsApp', placeholder: 'e.g. 628..' },
  {
    key: 'youtube_embed_url',
    label: 'YouTube Embed URL',
    placeholder: 'e.g. https://youtu.be/...',
  },
  // { key: 'site_name', label: 'Nama Website' },
]

export default function WebSettingForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [key, setKey] = useState('')
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [youtubeList, setYoutubeList] = useState([''])
  const [placeholder, setPlaceholder] = useState('')

  const isEdit = Boolean(initialData)
  const isYoutube = key === 'youtube_embed_urls'

  useEffect(() => {
    if (open) {
      setKey(initialData?.key ?? '')
      setLabel(initialData?.label ?? '')
      setValue(initialData?.value ?? '')
    }
  }, [open, initialData])

  useEffect(() => {
    if (open) {
      if (initialData?.key === 'youtube_embed_urls') {
        try {
          const parsed = JSON.parse(initialData.value || '[]')
          setYoutubeList(parsed.length > 0 ? parsed : [''])
        } catch {
          setYoutubeList([''])
        }
      } else {
        setYoutubeList([''])
      }
    }
  }, [open, initialData])

  if (!open) return null

  const handleKeyChange = (val) => {
    const selected = WEB_SETTING_KEYS.find((k) => k.key === val)
    setKey(selected?.key ?? '')
    setLabel(selected?.label ?? '')
    setPlaceholder(selected?.placeholder ?? '')
  }

  const handleSubmit = () => {
    if (!key.trim()) return
    const finalValue = isYoutube
      ? JSON.stringify(youtubeList.filter((u) => u.trim() !== ''))
      : value.trim()
    onSubmit({ key: key.trim(), label: label.trim(), value: finalValue })
  }

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block mb-1.5'

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">
            {isEdit ? 'Edit Setting' : 'Add New Setting'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className={labelClass}>
              Key <span className="text-rose-400">*</span>
            </label>
            {isEdit ? (
              <div className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 flex items-center">
                <code className="text-[13px] text-blue-600 dark:text-orange-400 font-mono">
                  {key}
                </code>
              </div>
            ) : (
              <Select value={key} onValueChange={handleKeyChange}>
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <SelectValue placeholder="Pilih key setting..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {WEB_SETTING_KEYS.map((k) => (
                      <SelectItem key={k.key} value={k.key}>
                        <span className="font-mono text-[12px] text-blue-600 dark:text-orange-400 mr-2">
                          {k.key}
                        </span>
                        <span className="text-gray-500 text-[12px]">— {k.label}</span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <div>
            <label className={labelClass}>Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Nomor WhatsApp"
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className={labelClass}>Value</label>

            {isYoutube ? (
              <div className="space-y-2">
                {youtubeList.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const next = [...youtubeList]
                        next[i] = e.target.value
                        setYoutubeList(next)
                      }}
                      placeholder="https://www.youtube.com/embed/xxxxx"
                      className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() =>
                        setYoutubeList((prev) => prev.filter((_, idx) => idx !== i) || [''])
                      }
                      className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setYoutubeList((prev) => [...prev, ''])}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-blue-600 dark:text-orange-400 hover:text-blue-700 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Video
                </button>
              </div>
            ) : (
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                placeholder={placeholder}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors resize-none"
              />
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !key.trim()}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl transition-all uppercase tracking-wide"
          >
            {loading ? 'Saving...' : 'Save Setting'}
          </button>
        </div>
      </div>
    </div>
  )
}
