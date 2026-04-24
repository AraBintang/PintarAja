import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EMPTY_FORM = {
  name: '',
  paperId: '',
  sectionId: '',
  value: '',
}

export default function PromptForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  papers = [],
  sections = [],
  loading = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM)

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      setFormData(
        initialData
          ? {
              name: initialData.name ?? '',
              paperId: String(initialData.paperId ?? ''),
              sectionId: String(initialData.sectionId ?? ''),
              value: initialData.value ?? '',
            }
          : EMPTY_FORM,
      )
    }
  }, [open, initialData])

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  // Harus di atas early return agar tidak melanggar Rules of Hooks
  const filteredSections = useMemo(() => {
    if (!formData.paperId) return []
    return sections.filter((s) => String(s.paper_id) === String(formData.paperId))
  }, [sections, formData.paperId])

  const handlePaperChange = (value) => {
    setFormData((prev) => ({ ...prev, paperId: value, sectionId: '' }))
  }

  if (!open) return null

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      paperId: Number(formData.paperId),
      sectionId: Number(formData.sectionId),
      value: formData.value,
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col"
          >
            <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg tracking-wide uppercase">
                {isEdit ? 'Edit Prompt' : 'Input Data Prompt'}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Prompt Title</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    placeholder="e.g. Akademik Writer"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Paper</label>
                  <Select value={formData.paperId} onValueChange={handlePaperChange}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Pilih Paper" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        {papers.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>
                    Section Paper
                    {formData.paperId && filteredSections.length === 0 && (
                      <span className="ml-2 text-[11px] font-normal text-amber-500 dark:text-amber-400">
                        No sections available for this paper
                      </span>
                    )}
                  </label>
                  <Select
                    value={formData.sectionId}
                    onValueChange={set('sectionId')}
                    disabled={!formData.paperId || filteredSections.length === 0}
                  >
                    <SelectTrigger
                      className={`${triggerClass} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <SelectValue
                        placeholder={
                          !formData.paperId
                            ? 'Select a paper first'
                            : filteredSections.length === 0
                              ? 'No sections available'
                              : 'Pilih Section Paper'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        {filteredSections.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className={labelClass}>Text Prompt</label>
                <textarea
                  value={formData.value}
                  onChange={set('value')}
                  placeholder="Tulis prompt di sini..."
                  rows={5}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors resize-y"
                />
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
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all uppercase tracking-wide"
              >
                {loading ? 'Saving...' : 'Save Prompt'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
