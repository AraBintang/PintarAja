import { FileText, Folder, Loader2, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import Pagination from '@/components/Pagination'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const PAGE_SIZE = 5

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let value = bytes
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(1)} ${units[index]}`
}

function getFileExt(mime = '') {
  if (mime.includes('pdf')) return 'PDF'
  if (mime.includes('word') || mime.includes('docx')) return 'DOCX'
  if (mime.includes('text')) return 'TXT'
  return mime.split('/')[1]?.toUpperCase() || '—'
}

export default function FilesTab() {
  const { showSnackbar } = useSnackbar()
  const [files, setFiles] = useState([])
  const [quota, setQuota] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchFiles = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const res = await request(
        `/writers/files?page=${page}&per_page=${PAGE_SIZE}&search=${encodeURIComponent(search)}`,
      )
      setFiles(res.files || [])
      setQuota(res.quota || null)
      setPagination(res.pagination || null)
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal memuat file')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles(currentPage, searchQuery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery])

  // Reset page on search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleDelete = async (file) => {
    if (deleting) return
    setDeleting(file.id)
    try {
      await request('/writers/delete-file', {
        method: 'DELETE',
        body: {
          providerId: file.providerId,
          fileId: file.fileId,
          vectorStoreId: file.vectorStoreId,
        },
      })
      showSnackbar('success', `File "${file.name}" berhasil dihapus`)
      // Re-fetch current page (it might go empty, so go to prev page if needed)
      const newTotal = (pagination?.total ?? 1) - 1
      const maxPage = Math.max(1, Math.ceil(newTotal / PAGE_SIZE))
      const targetPage = Math.min(currentPage, maxPage)
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage)
      } else {
        fetchFiles(currentPage, searchQuery)
      }
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal menghapus file')
    } finally {
      setDeleting(null)
    }
  }

  const usedPercent = quota ? Math.min(100, (quota.used / quota.limit) * 100) : 0

  return (
    <div className="px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-x-3 gap-y-2">
        <div className="flex gap-3 items-center">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 dark:bg-orange-500/10 dark:border-orange-500/20 flex items-center justify-center">
            <Folder className="w-4 h-4 text-blue-500 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            File Referensi
          </h2>

          {quota && (
            <span className="mb-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-500 dark:bg-orange-500/10 dark:border-orange-500/25 dark:text-orange-400">
              {quota.count} file
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Kelola seluruh file referensi AI Writer Anda
        </p>
      </div>

      {/* Top grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Quota card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06]">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Penyimpanan
          </p>
          <div className="flex items-baseline gap-1.5 mt-2.5">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {quota ? formatBytes(quota.used) : '—'}
            </span>
            <span className="text-sm text-gray-400 dark:text-gray-500">
              / {quota ? formatBytes(quota.limit) : '500 MB'}
            </span>
          </div>

          <div className="mt-3 h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
              style={{ width: `${usedPercent}%` }}
            />
          </div>

          <div className="mt-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500 dark:text-gray-400">Jumlah file</span>
              <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                {quota?.count ?? '—'}
              </span>
            </div>
            <div className="h-px bg-gray-100 dark:bg-white/[0.05]" />
            <div className="flex justify-between items-center">
              <span className="text-[13px] text-gray-500 dark:text-gray-400">Tersisa</span>
              <span className="text-[13px] font-semibold text-blue-600 dark:text-orange-400">
                {quota ? formatBytes(quota.remaining) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Guide card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06]">
          <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-200">Cara pakai</p>
          <p className="mt-2 text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Upload file sebagai referensi AI Writer. File tersimpan di server dan bisa dihapus kapan
            saja. Maksimal 20 file per generate.
          </p>
          <div className="mt-4 space-y-2">
            {[
              'Maks. 500 MB total',
              'PDF, DOCX, TXT didukung',
              'Hingga 20 file per generate',
              'Hapus file yang tidak terpakai',
            ].map((tip) => (
              <div
                key={tip}
                className="flex items-center gap-2.5 text-[12px] text-gray-400 dark:text-gray-500"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-orange-400 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Cari file referensi..."
          className="w-full h-10 pl-10 pr-4 text-[13px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
        />
      </div>

      {/* File list */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="flex items-center gap-2.5 p-5 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] text-gray-400 dark:text-gray-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Memuat file...
          </div>
        ) : files.length === 0 ? (
          <div className="py-12 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.07] text-center">
            <Folder className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {searchQuery ? 'Tidak ada file yang cocok.' : 'Belum ada file referensi tersimpan.'}
            </p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-white/[0.06] hover:border-blue-500/30 dark:hover:border-orange-500/30 dark:hover:bg-gray-900/80 transition-all duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 dark:bg-orange-500/10 dark:border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-blue-500 dark:text-orange-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                  {formatBytes(file.size)} · {new Date(file.createdAt).toLocaleDateString('id-ID')}
                  {file.status === 'processing' && (
                    <span className="ml-2 text-amber-500 dark:text-amber-400 font-medium">
                      · Processing...
                    </span>
                  )}
                </p>
              </div>

              <span className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-gray-500">
                {getFileExt(file.mime)}
              </span>

              <button
                type="button"
                onClick={() => handleDelete(file)}
                disabled={deleting === file.id}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] text-red-500 dark:text-red-400 text-[12px] font-semibold hover:bg-red-100 dark:hover:bg-red-500/[0.15] disabled:opacity-40 transition-all duration-150"
              >
                {deleting === file.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Hapus
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06]">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.last_page}
            total={pagination.total}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            label="file"
          />
        </div>
      )}
    </div>
  )
}
