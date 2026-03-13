import { BookOpen, FolderPlus, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function PromptLibraryModal({ open, onClose, onSelect, prompts }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#4A90D9]" /> Prompt Library
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-[13px] mt-1">
            Pilih prompt untuk mengisi topik penelitian Anda.
          </p>
        </div>
        <div className="p-3 max-h-[350px] overflow-y-auto space-y-1">
          {prompts.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-[14px]">Belum ada prompt tersedia</p>
          ) : (
            prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => {
                  onSelect(prompt.value)
                  onClose()
                }}
                className="w-full text-left p-4 rounded-xl text-[14px] text-gray-600 dark:text-gray-300 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
              >
                <span className="font-semibold block text-[12px] text-gray-400 mb-1">
                  {prompt.name}
                </span>
                {prompt.value}
              </button>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-[13px] font-semibold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export function SaveWorkbookModal({
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

  if (!open) return null

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-white/20 dark:border-gray-700 rounded-[28px] shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800 dark:to-gray-800">
          <h3 className="text-gray-800 dark:text-gray-100 font-bold text-lg flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-[#4A90D9]" /> Simpan ke Workbook
          </h3>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 block">
              Nama File
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Contoh: Draft Pendahuluan Skripsi"
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400">
                Pilih Workbook
              </label>
              <button
                onClick={() => setShowAddWb(!showAddWb)}
                className="text-[11px] text-[#4A90D9] font-semibold hover:underline"
              >
                + Workbook Baru
              </button>
            </div>
            {showAddWb && (
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newWbName}
                  onChange={(e) => setNewWbName(e.target.value)}
                  placeholder="Nama workbook baru..."
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-[13px] rounded-xl px-3 py-2 outline-none focus:border-[#4A90D9]"
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
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-xl">
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
        <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/80">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="py-2.5 px-5 text-[14px] font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={!fileName.trim() || !workbookId || isSaving}
            className="py-2.5 px-6 text-[14px] font-bold text-white bg-gradient-to-r from-[#4A90D9] to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-md hover:shadow-lg transition-all rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FolderPlus className="w-4 h-4" />
            )}
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
