import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Filter,
  Plus,
  Search,
  Terminal,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import DeleteModal from '@/components/DeleteModal'
import PromptForm from '@/components/prompt/PromptForm'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSnackbar } from '@/context/SnackbarContext'
import { usePrompts } from '@/helpers/usePrompts'
import { Debounce } from '@/utils/Debounce'

const PAGE_SIZE = 10

function getPaperStyle(paperName = '') {
  if (paperName === 'Bisnis')
    return {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      icon: '💼',
    }
  if (paperName === 'Pendidikan')
    return {
      bg: 'bg-blue-50 dark:bg-orange-900/20',
      text: 'text-blue-700 dark:text-orange-400',
      border: 'border-blue-100 dark:border-orange-900/30',
      icon: '🎓',
    }
  return {
    bg: 'bg-gray-50 dark:bg-gray-700',
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-100 dark:border-gray-600',
    icon: '📋',
  }
}

export default function PromptAIPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterPaper, setFilterPaper] = useState('')
  const [filterSection, setFilterSection] = useState('')
  const [page, setPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [previewTarget, setPreviewTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const {
    prompts,
    papers,
    sections,
    pagination,
    summary,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts({
    search: debouncedSearch,
    filterPaper,
    filterSection,
    page,
    perPage: PAGE_SIZE,
  })

  const filteredSections = filterPaper
    ? sections.filter((section) => String(section.paper_id) === String(filterPaper))
    : []

  const stats = [
    {
      label: 'Total Prompt',
      value: summary.total,
      icon: Terminal,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    {
      label: 'Paper',
      value: summary.papers,
      icon: BookOpen,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
  ]

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (prompt) => {
    setEditTarget(prompt)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        await updatePrompt(editTarget.id, payload)
        showSnackbar('success', 'Prompt berhasil diperbarui')
      } else {
        await createPrompt(payload)
        showSnackbar('success', 'Prompt berhasil ditambahkan')
      }
      setIsFormOpen(false)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deletePrompt(deleteTarget.id)
      showSnackbar('success', 'Prompt berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = pagination?.last_page ?? 1
  const currentPage = pagination?.current_page ?? 1

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const selectTriggerClass =
    'w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0'

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              System Prompt AI
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola instruksi sistem dan behavior model AI
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Prompt
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}
                >
                  <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {loading ? '—' : stat.value}
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-[400px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search prompt..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
                showFilters
                  ? 'bg-blue-50 dark:bg-orange-900/20 border-blue-200 dark:border-orange-700 text-blue-700 dark:text-orange-400'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <Select
                value={filterPaper}
                onValueChange={(v) => {
                  const nextPaper = v === 'all' ? '' : v
                  setFilterPaper(nextPaper)
                  setFilterSection('')
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua Paper" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua Paper</SelectItem>
                    {papers.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filterSection}
                onValueChange={(v) => {
                  setFilterSection(v === 'all' ? '' : v)
                  setPage(1)
                }}
                disabled={!filterPaper}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder={filterPaper ? 'Semua Section' : 'Pilih Paper dulu'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    {filterPaper && <SelectItem value="all">Semua Section</SelectItem>}
                    {filteredSections.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {['No.', 'Prompt Information', 'Instructions', 'Action'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 3 ? 'text-right' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : prompts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada prompt ditemukan
                    </td>
                  </tr>
                ) : (
                  prompts.map((prompt, index) => {
                    const paperStyle = getPaperStyle(prompt.paperName)
                    const isExpanded = expandedRow === prompt.id
                    return (
                      <tr
                        key={prompt.id}
                        className="hover:bg-blue-50/20 dark:hover:bg-orange-900/10 transition-colors cursor-pointer"
                        onClick={() => setExpandedRow(isExpanded ? null : prompt.id)}
                      >
                        <td className="px-6 py-3.5 text-[13px] text-gray-400 font-medium">
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 mb-1.5 line-clamp-1">
                            {prompt.name}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${paperStyle.bg} ${paperStyle.text} ${paperStyle.border}`}
                          >
                            <span>{paperStyle.icon}</span>
                            {prompt.paperName} » {prompt.sectionName}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p
                            className={`text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed max-w-[500px] ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}
                          >
                            {prompt.value}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setPreviewTarget(prompt)}
                              title="Preview"
                              className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-orange-900/20 hover:bg-blue-100 dark:hover:bg-orange-900/40 flex items-center justify-center text-blue-600 dark:text-orange-400 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prompt)}
                              title="Edit"
                              className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(prompt)}
                              title="Hapus"
                              className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Viewing{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {pagination ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
                {pagination ? Math.min(currentPage * PAGE_SIZE, pagination.total) : 0}
              </span>{' '}
              from{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {pagination?.total ?? 0}
              </span>{' '}
              prompt
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="text-gray-400 text-sm px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-[13px] transition-colors ${
                      currentPage === p
                        ? 'bg-blue-600 dark:bg-orange-500 text-white shadow-sm shadow-blue-200 dark:shadow-orange-900/30'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTarget && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
          onClick={() => setPreviewTarget(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{previewTarget.name}</h3>
              <button
                onClick={() => setPreviewTarget(null)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <span className="text-xl leading-none">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                {(() => {
                  const s = getPaperStyle(previewTarget.paperName)
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${s.bg} ${s.text} ${s.border}`}
                    >
                      <span>{s.icon}</span>
                      {previewTarget.paperName} » {previewTarget.sectionName}
                    </span>
                  )
                })()}
              </div>
              <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {previewTarget.value}
              </p>
            </div>
          </div>
        </div>
      )}

      <PromptForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditTarget(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        papers={papers}
        sections={sections}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'Prompt AI'}
        name={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
