import { CloudUpload, Edit2, Eye, FileText, Filter, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'

import BlogForm from '@/components/blog/BlogForm'
import DeleteModal from '@/components/DeleteModal'
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
import { useBlogs } from '@/helpers/useBlogs'
import { Debounce } from '@/utils/Debounce'

const CATEGORIES = [
  'AI',
  'Tutorial',
  'News',
  'Technology',
  'Business',
  'Lifestyle',
  'Education',
  'Entertainment',
]

const PAGE_SIZE = 10

export default function BlogPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const { blogs, pagination, summary, loading, createBlog, updateBlog, deleteBlog } = useBlogs({
    search: debouncedSearch,
    category: filterCategory,
    status: filterStatus,
    page,
    perPage: PAGE_SIZE,
  })

  const stats = [
    {
      label: 'Total Articles',
      value: summary.total,
      icon: FileText,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    {
      label: 'Published',
      value: summary.published,
      icon: CloudUpload,
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Draft',
      value: summary.draft,
      icon: Edit2,
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Total Views',
      value: summary.views,
      icon: Eye,
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (blog) => {
    setEditTarget(blog)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        // API uses aliased 'id' field
        await updateBlog(editTarget.id, payload)
        showSnackbar('success', 'Artikel berhasil diperbarui')
      } else {
        await createBlog(payload)
        showSnackbar('success', 'Artikel berhasil ditambahkan')
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
      await deleteBlog(deleteTarget.id)
      showSnackbar('success', 'Artikel berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const selectTriggerClass =
    'w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0'

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Blog Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola artikel blog Pintaraja
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Article
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
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

        {/* Search & Filter */}
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
                placeholder="Search articles..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
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
                value={filterCategory}
                onValueChange={(v) => {
                  setFilterCategory(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua kategori</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
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
                  {['No.', 'Artikel', 'Kategori', 'Status', 'Views', 'Tanggal', 'Action'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i >= 2 ? 'text-center' : ''}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : blogs?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada artikel ditemukan
                    </td>
                  </tr>
                ) : (
                  blogs.map((blog, index) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-[13px] text-gray-400 font-medium">
                        {(pagination?.current_page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {blog.image && (
                            <img
                              src={`/storage/${blog.image}`}
                              alt={blog.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[200px]">
                              {blog.title}
                            </p>
                            <p className="text-[12px] text-gray-400 truncate max-w-[200px]">
                              {blog.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[12px] font-medium border border-blue-100 dark:border-blue-800/30">
                          {blog.category || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            blog.is_published
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                          }`}
                        >
                          {blog.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center text-gray-700 dark:text-gray-300">
                        {blog.view_count}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 text-center">
                        {blog.published_at
                          ? new Date(blog.published_at).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              window.open(`${window.location.origin}/blog/${blog.slug}`, '_blank')
                            }
                            title="Preview"
                            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-emerald-900/20 hover:bg-blue-100 dark:hover:bg-emerald-900/40 flex items-center justify-center text-blue-600 dark:text-emerald-400 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(blog)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-orange-900/20 hover:bg-blue-100 dark:hover:bg-orange-900/40 flex items-center justify-center text-blue-600 dark:text-orange-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(blog)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination?.current_page}
              totalPages={pagination.last_page}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="articles"
              className="px-6 py-4 border-t border-gray-100 dark:border-gray-700"
            />
          )}
        </div>
      </div>

      <BlogForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'Article'}
        name={deleteTarget?.title ?? ''}
      />
    </div>
  )
}
