import { BookOpen, Loader2, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import Pagination from '@/components/Pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSnackbar } from '@/context/SnackbarContext'
import { buildQuery, request } from '@/utils/Http'

const PER_PAGE = 5

// ─── Add Custom Prompt Modal ──────────────────────────────────────────────────
function AddPromptModal({ open, onClose, onSaved, papers, sections }) {
  const { showSnackbar } = useSnackbar()

  const EMPTY = useMemo(() => ({ name: '', paperId: '', sectionId: '', value: '' }), [])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const filteredSections = form.paperId
    ? sections.filter((s) => String(s.paper_id) === form.paperId)
    : []

  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setError('')
    }
  }, [open, EMPTY])

  useEffect(() => {
    setForm((p) => ({ ...p, sectionId: '' }))
  }, [form.paperId])

  if (!open) return null

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target?.value ?? e }))

  const handleSave = async () => {
    if (!form.name.trim() || !form.paperId || !form.sectionId || !form.value.trim()) {
      setError('Semua field wajib diisi.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await request('/prompts', {
        method: 'POST',
        body: {
          custom: true,
          name: form.name,
          paperId: Number(form.paperId),
          sectionId: Number(form.sectionId),
          value: form.value,
        },
      })
      onSaved()
      onClose()
    } catch {
      showSnackbar('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9]/30 transition-all'

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-gray-100 dark:border-gray-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-[#4A90D9]" />
            </div>
            Tambah Custom Prompt
          </h4>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          {/* Nama prompt */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
              Nama Prompt *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Contoh: Prompt Pendahuluan Skripsi"
              className={inputCls}
            />
          </div>

          {/* Paper */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
              Paper *
            </label>
            <Select
              value={form.paperId}
              onValueChange={(v) => setForm((p) => ({ ...p, paperId: v }))}
            >
              <SelectTrigger className="h-10 text-[13px] border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <SelectValue placeholder="Pilih paper" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectGroup>
                  {papers.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)} className="text-[12px]">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Section */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
              Section *
            </label>
            <Select
              value={form.sectionId}
              onValueChange={(v) => setForm((p) => ({ ...p, sectionId: v }))}
              disabled={!form.paperId}
            >
              <SelectTrigger className="h-10 text-[13px] border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 disabled:opacity-50">
                <SelectValue placeholder={!form.paperId ? 'Pilih paper dulu' : 'Pilih section'} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectGroup>
                  {filteredSections.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)} className="text-[12px]">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Value */}
          <div>
            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
              Prompt Value *
            </label>
            <textarea
              value={form.value}
              onChange={set('value')}
              placeholder="Tulis isi prompt di sini..."
              rows={4}
              className={`${inputCls} resize-vertical`}
            />
          </div>

          {error && <p className="text-[12px] text-red-500 dark:text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-700/60 flex justify-end gap-2 bg-gray-50/50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-[13px] font-bold text-white bg-[#4A90D9] hover:bg-blue-600 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PromptLibraryModal({ open, onClose, onSelect, papers, sections }) {
  const [custom, setCustom] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedPaperId, setSelectedPaperId] = useState('all')
  const [selectedSectionId, setSelectedSectionId] = useState('all')
  const [page, setPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)

  const [prompts, setPrompts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)

  // Cache: key = serialized query params → { prompts, pagination }
  const cache = useRef({})

  const fetchPrompts = useCallback(
    async (opts = {}) => {
      const params = {
        custom,
        view: 'writer',
        page,
        per_page: PER_PAGE,
        search: search.trim() || undefined,
        paperId: selectedPaperId !== 'all' ? selectedPaperId : undefined,
        sectionId: selectedSectionId !== 'all' ? selectedSectionId : undefined,
      }

      const cacheKey = JSON.stringify(params)

      // Gunakan cache kalau ada & tidak di-force
      if (!opts.force && cache.current[cacheKey]) {
        const cached = cache.current[cacheKey]
        setPrompts(cached.prompts)
        setPagination(cached.pagination)
        return
      }

      setLoading(true)
      try {
        const query = buildQuery(params)
        const res = await request(`/prompts${query}`)
        const result = { prompts: res.data || [], pagination: res.pagination }

        cache.current[cacheKey] = result
        setPrompts(result.prompts)
        setPagination(result.pagination)
      } catch {
        setPrompts([])
      } finally {
        setLoading(false)
      }
    },
    [custom, page, search, selectedPaperId, selectedSectionId],
  )

  // Reset saat modal dibuka
  useEffect(() => {
    if (open) {
      cache.current = {} // clear cache saat modal dibuka ulang
      setSearch('')
      setSelectedPaperId('all')
      setSelectedSectionId('all')
      setPage(1)
      setCustom(false)
    }
  }, [open])

  // Reset page saat filter berubah
  useEffect(() => {
    if (!open) return
    setPage(1)
  }, [search, selectedPaperId, selectedSectionId, custom, open])

  // Fetch dengan debounce untuk search
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => fetchPrompts(), search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [open, fetchPrompts, search])

  // Reset section saat paper berubah
  useEffect(() => {
    setSelectedSectionId('all')
  }, [selectedPaperId])

  const filteredSections =
    selectedPaperId === 'all' ? [] : sections.filter((s) => String(s.paper_id) === selectedPaperId)

  // Setelah add prompt baru, bust cache tab custom & refetch
  const handlePromptSaved = () => {
    // Hapus semua cache entry yang custom=true
    Object.keys(cache.current).forEach((key) => {
      if (key.includes('"custom":true')) delete cache.current[key]
    })
    setCustom(true)
    setPage(1)
    fetchPrompts({ force: true })
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700/60"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4">
                <div>
                  <h3 className="text-gray-800 dark:text-gray-100 font-bold text-base flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-[#4A90D9]" />
                    </div>
                    Prompt Library
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-1 ml-9">
                    {loading ? 'Loading...' : `${pagination?.total ?? 0} prompt available`}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex justify-around gap-2 px-4">
                <button
                  onClick={() => setCustom(false)}
                  className={`px-4 py-2 w-1/2 rounded-t-xl border border-b-0 text-[13px] font-medium transition-all ${
                    !custom
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-[#4A90D9] border-blue-100 dark:border-blue-500/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700/60 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Library Prompts
                </button>
                <button
                  onClick={() => setCustom(true)}
                  className={`px-4 py-2 w-1/2 rounded-t-xl border border-b-0 text-[13px] font-medium transition-all ${
                    custom
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-[#4A90D9] border-blue-100 dark:border-blue-500/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-100 dark:border-gray-700/60 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Custom Prompts
                </button>
              </div>

              {/* Filters */}
              <div className="px-4 py-3 border-y border-gray-100 dark:border-gray-700/60 space-y-2.5">
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative flex-1">
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Add Custom Prompt button — hanya di tab library */}
                  {custom && prompts.length !== 0 && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="h-9 px-3 flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#4A90D9] hover:bg-blue-600 rounded-xl transition-all shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Custom
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
                        placeholder={
                          selectedPaperId === 'all' ? 'Select Paper First' : 'All Sections'
                        }
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
              <motion.div
                animate={{ height: 'auto' }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="overflow-hidden"
              >
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
                      {custom && (
                        <button
                          onClick={() => {
                            setCustom(false)
                            setShowAddModal(true)
                          }}
                          className="mt-3 px-4 py-1.5 text-[12px] font-semibold text-[#4A90D9] border border-[#4A90D9]/30 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                        >
                          + Tambah Prompt Pertamamu
                        </button>
                      )}
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
              </motion.div>

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.last_page}
                  total={pagination.total}
                  pageSize={PER_PAGE}
                  onPageChange={setPage}
                  label="prompts"
                  className="px-5 py-3 border-t border-gray-100 dark:border-gray-700/60"
                />
              )}
            </motion.div>
          </motion.div>

          {/* Add Custom Prompt Modal */}
          <AddPromptModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSaved={handlePromptSaved}
            papers={papers}
            sections={sections}
          />
        </>
      )}
    </AnimatePresence>
  )
}
