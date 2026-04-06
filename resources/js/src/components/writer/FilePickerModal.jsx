import { Check, FileText, Loader2, Paperclip, Search, Upload, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import Pagination from '@/components/Pagination'
import { request } from '@/utils/Http'

const PAGE_SIZE = 5
const MAX_FILES = 20

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt', '.md', '.pptx']
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileTypeIcon({ fileName, className = 'w-4 h-4' }) {
  const ext = fileName?.split('.').pop()?.toLowerCase()
  const colorMap = {
    pdf: 'text-red-500',
    docx: 'text-blue-600',
    doc: 'text-blue-600',
    txt: 'text-gray-500',
    md: 'text-purple-500',
    pptx: 'text-orange-500',
  }
  return (
    <svg
      className={`${className} ${colorMap[ext] || 'text-gray-500'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

export default function FilePickerModal({
  open,
  onClose,
  selectedAiId,
  selectedFiles = [],
  onConfirm,
}) {
  /* ── saved files list ── */
  const [savedFiles, setSavedFiles] = useState([])
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  /* ── local selection (working copy) ── */
  const [localSelected, setLocalSelected] = useState([])

  /* ── upload new ── */
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // { current, total, fileName }
  const fileInputRef = useRef(null)

  /* ── tab ── */
  const [tab, setTab] = useState('saved') // 'saved' | 'upload'

  /* init local selection when modal opens */
  useEffect(() => {
    if (open) {
      setLocalSelected([...selectedFiles])
      setTab('saved')
      setSearchQuery('')
      setCurrentPage(1)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  /* fetch saved files */
  const fetchSavedFiles = useCallback(async () => {
    setLoadingSaved(true)
    try {
      const res = await request(
        `/writers/files?page=${currentPage}&per_page=${PAGE_SIZE}&search=${encodeURIComponent(searchQuery)}`,
      )
      setSavedFiles(res.files || [])
      setPagination(res.pagination || null)
    } catch {
      /* silent */
    } finally {
      setLoadingSaved(false)
    }
  }, [currentPage, searchQuery])

  useEffect(() => {
    if (open && tab === 'saved') fetchSavedFiles()
  }, [open, tab, currentPage, searchQuery, fetchSavedFiles])

  /* reset page on search change */
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const isSelected = (fileId) => localSelected.some((f) => f.fileId === fileId)

  const toggleFile = (file) => {
    const ref = {
      source: 'saved',
      id: file.id,
      fileId: file.fileId,
      vectorStoreId: file.vectorStoreId,
      fileName: file.name,
      fileSize: file.size,
    }
    if (isSelected(file.fileId)) {
      setLocalSelected((prev) => prev.filter((f) => f.fileId !== file.fileId))
    } else {
      if (localSelected.length >= MAX_FILES) return
      setLocalSelected((prev) => [...prev, ref])
    }
  }

  /* ── Upload new files ── */
  const handleUploadFiles = async (files) => {
    if (!selectedAiId || isUploading) return
    const validFiles = Array.from(files).filter((f) => {
      const ext = '.' + f.name.split('.').pop().toLowerCase()
      return ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME.includes(f.type)
    })
    if (!validFiles.length) return

    // check how many slots remain
    const slots = MAX_FILES - localSelected.length
    const toUpload = validFiles.slice(0, slots)

    setIsUploading(true)
    setUploadProgress({ current: 0, total: toUpload.length, fileName: '' })

    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    const newlyUploaded = []

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      setUploadProgress({ current: i + 1, total: toUpload.length, fileName: file.name })
      try {
        const formData = new FormData()
        formData.append('providerId', selectedAiId)
        formData.append('file', file)

        const res = await fetch('/api/writers/upload-file', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'X-Requested-With': 'XMLHttpRequest' },
          body: formData,
        })
        if (!res.ok) continue
        const data = await res.json()
        newlyUploaded.push({
          source: 'new',
          id: data.id,
          fileId: data.fileId,
          vectorStoreId: data.vectorStoreId,
          fileName: data.fileName,
          fileSize: data.fileSize,
        })
      } catch {
        /* skip failed */
      }
    }

    setLocalSelected((prev) => [...prev, ...newlyUploaded])
    setIsUploading(false)
    setUploadProgress(null)

    // refresh saved list & switch tab
    fetchSavedFiles()
    if (newlyUploaded.length) setTab('saved')
  }

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) handleUploadFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) handleUploadFiles(e.dataTransfer.files)
  }

  const handleConfirm = () => {
    onConfirm(localSelected)
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative w-full sm:max-w-xl bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
              Pilih File Referensi
            </h3>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
              Maks. {MAX_FILES} file · {localSelected.length} terpilih
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected chips */}
        {localSelected.length > 0 && (
          <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {localSelected.map((f) => (
                <div
                  key={f.fileId}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-full"
                >
                  <FileTypeIcon fileName={f.fileName} className="w-3 h-3" />
                  <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 max-w-[120px] truncate">
                    {f.fileName}
                  </span>
                  <button
                    onClick={() =>
                      setLocalSelected((prev) => prev.filter((x) => x.fileId !== f.fileId))
                    }
                    className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-3 flex-shrink-0">
          {[
            { key: 'saved', label: 'File Tersimpan', icon: FileText },
            { key: 'upload', label: 'Upload Baru', icon: Upload },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors ${
                tab === key
                  ? 'bg-blue-600 dark:bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 pt-3 space-y-3">
          {tab === 'saved' ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari file referensi..."
                  className="w-full h-10 pl-9 pr-4 text-[13px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
                />
              </div>

              {/* File list */}
              {loadingSaved ? (
                <div className="flex items-center justify-center gap-2 py-10 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat file...
                </div>
              ) : savedFiles.length === 0 ? (
                <div className="py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                  {searchQuery ? 'Tidak ada file yang cocok.' : 'Belum ada file tersimpan.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {savedFiles.map((file) => {
                    const selected = isSelected(file.fileId)
                    const disabled = !selected && localSelected.length >= MAX_FILES
                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => toggleFile(file)}
                        disabled={disabled}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : disabled
                              ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                              : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/50 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                        }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            selected
                              ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {/* Icon */}
                        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <FileTypeIcon fileName={file.name} className="w-4 h-4" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {file.name}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {formatFileSize(file.size)} ·{' '}
                            {new Date(file.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.last_page > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.last_page}
                  total={pagination.total}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCurrentPage}
                  label="file"
                  className="pt-2"
                />
              )}
            </>
          ) : (
            /* Upload tab */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center transition-colors hover:border-blue-300 dark:hover:border-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={handleFileInputChange}
              />

              {isUploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200">
                      Mengupload {uploadProgress?.current}/{uploadProgress?.total}
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 truncate max-w-[220px]">
                      {uploadProgress?.fileName}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 flex items-center justify-center">
                    <Paperclip className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-700 dark:text-gray-200">
                      Drag & drop file, atau{' '}
                      <button
                        type="button"
                        className="text-blue-600 dark:text-blue-400 underline underline-offset-2"
                        disabled={localSelected.length >= MAX_FILES}
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                      PDF, DOCX, TXT, MD, PPTX · Maks. 20MB/file
                    </p>
                  </div>
                  {localSelected.length >= MAX_FILES && (
                    <p className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                      Batas {MAX_FILES} file tercapai
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 flex-shrink-0">
          <p className="text-[12px] text-gray-400 dark:text-gray-500">
            {localSelected.length}/{MAX_FILES} file dipilih
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-[13px] font-semibold rounded-xl bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              Gunakan {localSelected.length > 0 ? `(${localSelected.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>,

    document.body,
  )
}
