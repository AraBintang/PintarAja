import { BookOpen, ChevronLeft, ChevronRight, FolderPlus, Loader2, Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { buildQuery, request } from '@/utils/Http'

const PER_PAGE = 5

export function PromptLibraryModal({ open, onClose, onSelect, papers, sections }) {
  const [search, setSearch] = useState('')
  const [selectedPaperId, setSelectedPaperId] = useState('all')
  const [selectedSectionId, setSelectedSectionId] = useState('all')
  const [page, setPage] = useState(1)

  const [prompts, setPrompts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request(
        `/prompts${buildQuery({
          view: 'writer',
          page,
          per_page: PER_PAGE,
          search: search.trim() || undefined,
          paperId: selectedPaperId !== 'all' ? selectedPaperId : undefined,
          sectionId: selectedSectionId !== 'all' ? selectedSectionId : undefined,
        })}`,
      )
      setPrompts(res.data || [])
      setTotal(res.pagination?.total || 0)
    } catch {
      setPrompts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, search, selectedPaperId, selectedSectionId])

  // Reset & fetch when modal opens
  useEffect(() => {
    if (open) {
      setSearch('')
      setSelectedPaperId('all')
      setSelectedSectionId('all')
      setPage(1)
    }
  }, [open])

  // Debounce search, reset page on filter change
  useEffect(() => {
    if (!open) return
    setPage(1)
  }, [search, selectedPaperId, selectedSectionId, open])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => fetchPrompts(), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [fetchPrompts, open, search])

  // Filter sections by selected paper
  const filteredSections =
    selectedPaperId === 'all' ? [] : sections.filter((s) => String(s.paper_id) === selectedPaperId)

  // Reset section if paper changes
  useEffect(() => {
    setSelectedSectionId('all')
  }, [selectedPaperId])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700/60"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700/60">
          <div>
            <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-[#4A90D9]" />
              </div>
              Prompt Library
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-1 ml-9">
              {loading ? 'Loading...' : `${total} prompt avalaible`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/60 space-y-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompt..."
              className="w-full h-9 pl-9 pr-8 text-[13px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Paper + Section filter */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={selectedPaperId} onValueChange={setSelectedPaperId}>
              <SelectTrigger className="h-9 text-[12px] border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="All Paper" />
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                <SelectGroup>
                  <SelectItem value="all" className="text-[12px]">
                    All Paper
                  </SelectItem>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-[12px]">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={selectedPaperId === 'all'}
            >
              <SelectTrigger className="h-9 text-[12px] border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 disabled:opacity-50">
                <SelectValue
                  placeholder={selectedPaperId === 'all' ? 'Select Paper First' : 'All Sections'}
                />
              </SelectTrigger>
              <SelectContent className="max-h-[220px]">
                <SelectGroup>
                  <SelectItem value="all" className="text-[12px]">
                    All Sections
                  </SelectItem>
                  {filteredSections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="text-[12px]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 min-h-0"
          style={{ minHeight: '240px' }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#4A90D9] animate-spin mb-2" />
              <p className="text-gray-400 text-[12px]">loading prompt...</p>
            </div>
          ) : prompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[13px] font-medium">
                Prompt not found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-1">
                Try changing the filter or keyword
              </p>
            </div>
          ) : (
            prompts.map((prompt, idx) => (
              <button
                key={prompt.id}
                onClick={() => {
                  onSelect(prompt.value)
                  onClose()
                }}
                className="group w-full text-left p-4 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800/60 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-150"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0 text-[11px] font-bold text-gray-400 group-hover:border-blue-300 dark:group-hover:border-blue-700 group-hover:text-blue-500 transition-all">
                    {(page - 1) * PER_PAGE + idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-1">
                      {prompt.name}
                    </span>

                    {/* Badge paper & section */}
                    {(prompt.paperName || prompt.sectionName) && (
                      <div className="flex items-center gap-1.5 mb-2">
                        {prompt.paperName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20">
                            {prompt.paperName}
                          </span>
                        )}
                        {prompt.sectionName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                            {prompt.sectionName}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="block text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                      {prompt.value}
                    </span>
                  </div>
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 mt-0.5">
                    <div className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md whitespace-nowrap">
                      Use →
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
          <span className="text-[12px] text-gray-400 dark:text-gray-500">
            {total > 0 ? `Viewing page ${page} of ${totalPages}` : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('ellipsis-' + p)
                acc.push(p)
                return acc
              }, [])
              .map((item) =>
                String(item).startsWith('ellipsis') ? (
                  <span
                    key={item}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 text-[12px]"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-semibold transition-all disabled:cursor-not-allowed
                      ${
                        page === item
                          ? 'bg-[#4A90D9] text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-white/20 dark:border-gray-700 rounded-[28px] shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800 dark:to-gray-800">
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
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-[14px] rounded-xl px-4 py-2.5 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all"
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
            Cancel
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
            {isSaving ? 'Saving...' : 'Save Document'}
          </button>
        </div>
      </div>
    </div>
  )
}
