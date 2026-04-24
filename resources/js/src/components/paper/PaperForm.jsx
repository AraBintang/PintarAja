import { Plus, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

const EMPTY_SECTIONS = ['']

export default function PaperForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) {
  const [name, setName] = useState('')
  const [sections, setSections] = useState(EMPTY_SECTIONS)

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name ?? '')
        setSections(
          initialData.sections && initialData.sections.length > 0
            ? initialData.sections.map((s) => s.name ?? s)
            : EMPTY_SECTIONS,
        )
      } else {
        setName('')
        setSections(EMPTY_SECTIONS)
      }
    }
  }, [open, initialData])

  const handleAddSection = () => setSections((prev) => [...prev, ''])

  const handleRemoveSection = (idx) =>
    setSections((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      return next.length > 0 ? next : EMPTY_SECTIONS
    })

  const handleSectionChange = (idx, value) =>
    setSections((prev) => prev.map((s, i) => (i === idx ? value : s)))

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      sections: sections.filter((s) => s.trim() !== ''),
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg tracking-wide">
                {isEdit ? 'Edit Paper Setting' : 'Add New Paper'}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="space-y-2">
                <label className={labelClass}>Paper Type Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Skripsi"
                  className={inputClass}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Paper Sections</label>
                  <button
                    onClick={handleAddSection}
                    className="text-[12px] font-bold text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-3">
                  {sections.map((section, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-300 w-4">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={section}
                          onChange={(e) => handleSectionChange(idx, e.target.value)}
                          placeholder={`Section ${idx + 1} Name`}
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl pl-8 pr-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSection(idx)}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 dark:hover:text-rose-300 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 italic">
                  Sections determine the breakdown of content for this paper type.
                </p>
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
                {loading ? 'Saving...' : 'Save Paper'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
