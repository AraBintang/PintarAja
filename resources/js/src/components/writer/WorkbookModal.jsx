import { FolderPlus, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function SaveWorkbookModal({
  open,
  onClose,
  defaultName,
  onSave,
  workbooks,
  onAddWorkbook,
}) {
  const [fileName, setFileName] = useState(defaultName || '')
  const [workbookId, setWorkbookId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [newWbName, setNewWbName] = useState('')
  const [isAddingWb, setIsAddingWb] = useState(false)
  const [showAddWb, setShowAddWb] = useState(false)

  useEffect(() => {
    if (open) {
      setFileName(defaultName || '')
      setWorkbookId(workbooks[0]?.id?.toString() || '')
      setIsSaving(false)
      setShowAddWb(false)
      setNewWbName('')
    }
  }, [open, defaultName, workbooks])

  const handleSave = async () => {
    if (!fileName.trim() || !workbookId) return
    setIsSaving(true)
    try {
      await onSave(fileName, workbookId)
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddWorkbook = async () => {
    if (!newWbName.trim()) return
    setIsAddingWb(true)
    try {
      await onAddWorkbook(newWbName)
      setNewWbName('')
      setShowAddWb(false)
    } finally {
      setIsAddingWb(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 rounded-[28px] shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900">
              <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#4A90D9]" /> Save Document
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
                  Document Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Contoh: Draft Pendahuluan Skripsi"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">
                    Select Workbook
                  </label>
                  <button
                    onClick={() => setShowAddWb(!showAddWb)}
                    className="text-[11px] text-[#4A90D9] font-semibold hover:underline"
                  >
                    + New Workbook
                  </button>
                </div>
                {showAddWb && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newWbName}
                      onChange={(e) => setNewWbName(e.target.value)}
                      placeholder="Nama workbook baru..."
                      className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#4A90D9]"
                    />
                    <button
                      onClick={handleAddWorkbook}
                      disabled={!newWbName.trim() || isAddingWb}
                      className="px-3 py-2 bg-[#4A90D9] text-white text-[12px] font-bold rounded-xl disabled:opacity-50"
                    >
                      {isAddingWb ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Tambah'}
                    </button>
                  </div>
                )}
                <Select value={workbookId} onValueChange={setWorkbookId}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700/60 text-gray-800 dark:text-gray-200 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all">
                    <SelectValue placeholder="Pilih workbook tujuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {workbooks.map((wb) => (
                        <SelectItem key={wb.id} value={wb.id.toString()}>
                          {wb.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-gray-700/60 flex justify-end gap-3 bg-gray-white dark:bg-gray-900">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 text-[13px] font-semibold rounded-xl border border-gray-100 dark:border-gray-700/60 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!fileName.trim() || !workbookId || isSaving}
                className="py-2.5 px-6 text-[14px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-blue-500 hover:from-blue-500 hover:to-blue-600 dark:from-[#F2901E] dark:to-orange-500 dark:hover:from-orange-500 dark:hover:to-orange-600 shadow-md hover:shadow-lg transition-all rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FolderPlus className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Document'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
