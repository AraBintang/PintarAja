import {
  Check,
  Clock,
  Download,
  FileSearch,
  FileText,
  MessagesSquare,
  Mic,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRightSidebar } from '@/context/RightSidebarContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { buildQuery, request } from '@/utils/Http'

const PAGE_CONFIG = {
  '/chat': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/new': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/writer': { title: 'Saved Document', icon: FileText, apiPath: '/writers' },
  '/humanizer': { title: 'History Humanizer AI', icon: Wand2, apiPath: '/humans' },
  '/paraphrase': { title: 'History Paraphrase AI', icon: RefreshCw, apiPath: '/paraps' },
  '/transcribe': { title: 'History Transcribe AI', icon: Mic, apiPath: '/transcribes' },
  '/plagiarism': { title: 'History Plagiarism', icon: FileSearch, apiPath: '/plagiarism' },
}

const RENAME_SUPPORTED = ['/chat', '/new', '/writer', '/paraphrase', '/humanizer', '/transcribe']
const DELETE_SUPPORTED = ['/chat', '/new', '/writer', '/paraphrase', '/humanizer', '/transcribe']

const API_PREFIX = {
  '/chat': '/convers',
  '/new': '/convers',
  '/writer': '/documents',
  '/paraphrase': '/paraps',
  '/humanizer': '/humans',
  '/transcribe': '/transcribes',
}

const PER_PAGE = 15

export default function RightSidebar() {
  const { isOpen, close } = useRightSidebar()
  const { showSnackbar } = useSnackbar()
  const location = useLocation()

  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [historyItems, setHistoryItems] = useState([])
  const [workbooks, setWorkbooks] = useState([])
  const [activeWorkbook, setActiveWorkbook] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [activeItemId, setActiveItemId] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)

  const editInputRef = useRef(null)
  const sentinelRef = useRef(null)
  const searchTimerRef = useRef(null)

  const current = PAGE_CONFIG[location.pathname] || { title: 'Riwayat', icon: Clock, apiPath: null }
  const IconComponent = current.icon
  const canRename = RENAME_SUPPORTED.includes(location.pathname)
  const canDelete = DELETE_SUPPORTED.includes(location.pathname)
  const apiPrefix = API_PREFIX[location.pathname]

  // ─── FETCH ───────────────────────────────────────────────────

  const fetchItems = useCallback(
    async ({ pageNum = 1, search = '', append = false } = {}) => {
      if (pageNum === 1) {
        setIsLoading(true)
        if (!append) setHistoryItems([])
      } else {
        setIsFetchingMore(true)
      }

      try {
        if (location.pathname === '/writer') {
          const query = buildQuery({
            page: pageNum,
            per_page: PER_PAGE,
            search: search || undefined,
          })
          const res = await request(`/writers${query}`)
          const docs = Array.isArray(res.documents) ? res.documents : []
          if (pageNum === 1) {
            setWorkbooks(Array.isArray(res.workbooks) ? res.workbooks : [])
          }
          setHistoryItems((prev) => (pageNum === 1 ? docs : [...prev, ...docs]))
          setHasMore(docs.length === PER_PAGE)
          return
        }

        if (!current.apiPath) {
          setHistoryItems([])
          setHasMore(false)
          return
        }

        const query = buildQuery({ page: pageNum, per_page: PER_PAGE, search: search || undefined })
        const res = await request(`${current.apiPath}${query}`)
        const items = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : []
        setHistoryItems((prev) => (pageNum === 1 ? items : [...prev, ...items]))
        // Support both paginated (res.data + pagination meta) and plain array responses
        const total = res.pagination?.total ?? res.total ?? null
        if (total !== null) {
          setHasMore(pageNum * PER_PAGE < total)
        } else {
          setHasMore(items.length === PER_PAGE)
        }
      } catch {
        if (pageNum === 1) setHistoryItems([])
        setHasMore(false)
      } finally {
        setIsLoading(false)
        setIsFetchingMore(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  )

  // Reset & initial load when sidebar opens or route changes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setActiveWorkbook('all')
      setEditingId(null)
      setDeletingId(null)
      setPage(1)
      setHasMore(false)
      return
    }

    setPage(1)
    fetchItems({ pageNum: 1, search: searchQuery })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, location.pathname])

  // Debounced search — reset to page 1
  useEffect(() => {
    if (!isOpen) return
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setPage(1)
      fetchItems({ pageNum: 1, search: searchQuery })
    }, 350)
    return () => clearTimeout(searchTimerRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // IntersectionObserver — load next page when sentinel is visible
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingMore && !isLoading) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchItems({ pageNum: nextPage, search: searchQuery, append: true })
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isFetchingMore, isLoading, page, searchQuery, fetchItems])

  // ─── REALTIME EVENTS ─────────────────────────────────────────

  useEffect(() => {
    const handlers = {
      conversationCreated: (e) => {
        if (location.pathname !== '/chat' && location.pathname !== '/new') return
        const conv = e.detail
        setHistoryItems((prev) => {
          if (prev.some((h) => h.id === conv.id)) return prev
          return [
            {
              id: conv.id,
              title: conv.title || 'New Conversation',
              lastUpdated: conv.lastUpdated || 'Baru saja',
              chats: [],
              nextCursor: null,
              hasMoreChats: false,
              ai: [],
            },
            ...prev,
          ]
        })
        setActiveItemId(conv.id)
      },

      documentSaved: (e) => {
        if (location.pathname !== '/writer') return
        const doc = e.detail
        setHistoryItems((prev) => {
          const exists = prev.some((h) => h.id === doc.id)
          if (exists) return prev.map((h) => (h.id === doc.id ? { ...h, ...doc } : h))
          return [doc, ...prev]
        })
        setActiveItemId(doc.id)
      },

      paraphraseCompleted: (e) => {
        if (location.pathname !== '/paraphrase') return
        const item = e.detail
        setHistoryItems((prev) => {
          if (prev.some((h) => h.id === item.id)) return prev
          return [item, ...prev]
        })
        setActiveItemId(item.id)
      },

      transcribeCompleted: (e) => {
        if (location.pathname !== '/transcribe') return
        const item = e.detail
        setHistoryItems((prev) => {
          if (prev.some((h) => h.id === item.id)) return prev
          return [item, ...prev]
        })
        setActiveItemId(item.id)
      },

      plagiarismPaid: () => {
        if (location.pathname !== '/plagiarism') return
        setPage(1)
        fetchItems({ pageNum: 1, search: searchQuery })
      },
    }

    Object.entries(handlers).forEach(([event, handler]) => window.addEventListener(event, handler))
    return () =>
      Object.entries(handlers).forEach(([event, handler]) =>
        window.removeEventListener(event, handler),
      )
  }, [location.pathname, searchQuery, fetchItems])

  // Focus input when editing starts
  useEffect(() => {
    if (editingId !== null) {
      setTimeout(() => editInputRef.current?.focus(), 50)
    }
  }, [editingId])

  // ─── WORKBOOK FILTER (client-side only, no refetch needed) ───

  const filteredItems = useMemo(() => {
    let items = historyItems

    if (activeWorkbook !== 'all') {
      items = items.filter((doc) => {
        const docWorkbookName =
          doc.workbook_name ??
          (typeof doc.workbook === 'string' ? doc.workbook : doc.workbook?.name) ??
          null
        const matchedWorkbook = workbooks.find((wb) => wb.name === activeWorkbook)
        if (docWorkbookName !== null) return docWorkbookName === activeWorkbook
        if (matchedWorkbook && doc.workbook_id !== undefined)
          return String(doc.workbook_id) === String(matchedWorkbook.id)
        return false
      })
    }

    return items
  }, [historyItems, activeWorkbook, workbooks])

  // ─── ITEM CLICK ──────────────────────────────────────────────

  const handleItemClick = (item) => {
    if (editingId === item.id || deletingId === item.id) return
    setActiveItemId(item.id)

    const eventMap = {
      '/chat': 'loadHistoryChat',
      '/new': 'loadHistoryChat',
      '/writer': 'loadHistoryWriter',
      '/paraphrase': 'loadHistoryParaphrase',
      '/transcribe': 'loadHistoryTranscribe',
      '/humanizer': 'loadHistoryHumanizer',
    }

    const eventName = eventMap[location.pathname]
    if (!eventName) return

    const detail =
      location.pathname === '/chat' || location.pathname === '/new'
        ? {
            id: item.id,
            title: item.title,
            chats: item.chats ?? [],
            nextCursor: item.nextCursor ?? null,
            hasMoreChats: item.hasMoreChats ?? false,
          }
        : item

    window.dispatchEvent(new CustomEvent(eventName, { detail }))
    close()
  }

  // ─── RENAME ──────────────────────────────────────────────────

  const startEditing = (e, item) => {
    e.stopPropagation()
    setDeletingId(null)
    setEditingId(item.id)
    setEditingValue(item.title || item.name || '')
  }

  const cancelEditing = (e) => {
    e?.stopPropagation()
    setEditingId(null)
    setEditingValue('')
  }

  const submitRename = async (e, item) => {
    e?.stopPropagation()
    const newName = editingValue.trim()
    if (!newName || newName === (item.title || item.name)) {
      cancelEditing()
      return
    }

    try {
      await request(`${apiPrefix}/${item.id}`, {
        method: 'PUT',
        body: {
          title: newName,
          name: newName,
          workbookId: item?.workbook_id ?? null,
          result: item?.result ?? null,
        },
      })

      setHistoryItems((prev) =>
        prev.map((h) => (h.id === item.id ? { ...h, title: newName, name: newName } : h)),
      )

      if (location.pathname === '/chat' || location.pathname === '/new') {
        window.dispatchEvent(
          new CustomEvent('conversationRenamed', { detail: { id: item.id, title: newName } }),
        )
      }

      showSnackbar('success', 'Renamed successfully!')
    } catch (err) {
      showSnackbar('error', err?.message || 'Failed to rename. Please try again.')
    } finally {
      setEditingId(null)
      setEditingValue('')
    }
  }

  // ─── DELETE ──────────────────────────────────────────────────

  const startDelete = (e, item) => {
    e.stopPropagation()
    setEditingId(null)
    setDeletingId(item.id)
  }

  const cancelDelete = (e) => {
    e?.stopPropagation()
    setDeletingId(null)
  }

  const confirmDelete = async (e, item) => {
    e.stopPropagation()
    try {
      await request(`${apiPrefix}/${item.id}`, { method: 'DELETE' })
      setHistoryItems((prev) => prev.filter((h) => h.id !== item.id))
      window.dispatchEvent(
        new CustomEvent('historyItemDeleted', { detail: { id: item.id, path: location.pathname } }),
      )
      if (activeItemId === item.id) setActiveItemId(null)
      showSnackbar('success', 'Deleted successfully!')
    } catch (err) {
      showSnackbar('error', err?.message || 'Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── WORKBOOK ────────────────────────────────────────────────

  const handleDeleteWorkbook = async (e, wb) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await request(`/workbooks/${wb.id}`, { method: 'DELETE' })
      setWorkbooks((prev) => prev.filter((w) => w.id !== wb.id))
      if (activeWorkbook === wb.name) setActiveWorkbook('all')
      showSnackbar('success', `Workbook "${wb.name}" deleted!`)
    } catch (err) {
      showSnackbar('error', err?.message || 'Failed to delete workbook.')
    }
  }

  const [addingWorkbook, setAddingWorkbook] = useState(false)
  const [newWorkbookName, setNewWorkbookName] = useState('')

  const submitNewWorkbook = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const name = newWorkbookName.trim()
    if (!name) return
    try {
      await request('/workbooks', { method: 'POST', body: { name } })
      const updated = await request('/writers')
      setWorkbooks(Array.isArray(updated.workbooks) ? updated.workbooks : workbooks)
      showSnackbar('success', `Workbook "${name}" created!`)
    } catch (err) {
      showSnackbar('error', err?.message || 'Failed to create workbook.')
    } finally {
      setAddingWorkbook(false)
      setNewWorkbookName('')
    }
  }

  // ─── DOWNLOAD ────────────────────────────────────────────────

  const handleDownload = async (e, item) => {
    e.stopPropagation()
    if (downloadingId === item.id) return
    setDownloadingId(item.id)
    try {
      const res = await request(`/plagiarism/${item.id}/download`)
      if (res.download_url) {
        window.open(res.download_url, '_blank', 'noreferrer')
      } else {
        showSnackbar('error', 'URL download tidak tersedia')
      }
    } catch (err) {
      showSnackbar('error', err?.message || 'Gagal mengambil link download')
    } finally {
      setDownloadingId(null)
    }
  }

  // ─── RENDER ──────────────────────────────────────────────────

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-[340px] bg-white dark:bg-[#090d16] z-90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <IconComponent className="w-[18px] h-[18px] text-[#2686D4] dark:text-[#F2901E]" />
            <h2 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
              {current.title}
            </h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col border-b border-gray-200 dark:border-gray-800">
          {location.pathname === '/writer' && (
            <div className="px-4 pt-4 pb-1">
              <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                Active Workbook
              </label>
              <Select value={activeWorkbook} onValueChange={setActiveWorkbook}>
                <SelectTrigger className="w-full bg-[#f7f7f5] dark:bg-gray-800 border-transparent focus:border-[#4A90D9]/30 h-[42px] text-[13px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium">
                  <SelectValue placeholder="Pilih Workbook" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
                  <SelectGroup className="max-h-[190px] overflow-y-auto pr-1">
                    <SelectItem value="all">All Workbook</SelectItem>
                    {workbooks.map((wb) => (
                      <SelectItem
                        key={wb.id}
                        value={wb.name}
                        className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                      >
                        {wb.name}
                        <button
                          onClick={(e) => handleDeleteWorkbook(e, wb)}
                          onPointerDown={(e) => e.stopPropagation()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                          title="Hapus Workbook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-1" />
                  <div className="p-1.5">
                    {addingWorkbook ? (
                      <form
                        onSubmit={submitNewWorkbook}
                        className="flex items-center gap-1.5 px-1"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <input
                          autoFocus
                          value={newWorkbookName}
                          onChange={(e) => setNewWorkbookName(e.target.value)}
                          placeholder="Workbook name..."
                          className="flex-1 text-[12px] bg-gray-100 dark:bg-gray-700 rounded-md px-2.5 py-1.5 outline-none text-gray-700 dark:text-gray-300 border border-transparent focus:border-[#4A90D9]/40"
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setAddingWorkbook(false)
                              setNewWorkbookName('')
                            }
                          }}
                        />
                        <button
                          type="submit"
                          onPointerDown={(e) => e.stopPropagation()}
                          className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={() => {
                            setAddingWorkbook(false)
                            setNewWorkbookName('')
                          }}
                          className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <button
                        className="w-full flex items-center justify-start gap-2 px-2.5 py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setAddingWorkbook(true)
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Plus className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                        Add New Workbook
                      </button>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="px-4 py-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                location.pathname === '/writer' ? 'Search Document...' : 'Search History...'
              }
              className="w-full bg-[#f7f7f5] dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:bg-white dark:focus:bg-gray-700 border border-transparent focus:border-[#4A90D9]/30 transition-all font-medium"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 space-y-4 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-3/4 skeleton opacity-60" />
                    <div className="h-3 w-12 skeleton opacity-40" />
                  </div>
                  <div className="h-3 w-full skeleton opacity-30" />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
              <Clock className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Not found' : 'No history yet'}
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 text-center">
                {searchQuery
                  ? 'Try other keywords'
                  : 'History will appear once you start using this feature.'}
              </p>
            </div>
          ) : (
            <>
              {filteredItems.map((item) => {
                const isPlagiarism = location.pathname === '/plagiarism'
                const isEditing = editingId === item.id
                const isDeleting = deletingId === item.id
                const displayName = item.title || item.name || 'New Conversation'
                const isDownloading = downloadingId === item.id

                const lastChat = item.chats?.at(-1)
                const chatPreview = !isPlagiarism ? (lastChat?.content?.slice(0, 70) ?? '') : null

                return (
                  <div className="px-2" key={item.id}>
                    <div
                      onClick={() => !isPlagiarism && handleItemClick(item)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors group border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                        isPlagiarism ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        isDeleting
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30'
                          : activeItemId === item.id
                            ? 'bg-[#eeedeb] dark:bg-gray-900'
                            : isPlagiarism
                              ? 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                              : 'hover:bg-[#eeedeb] dark:hover:bg-gray-900'
                      }`}
                    >
                      {isPlagiarism ? (
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-0.5">
                                {item.service === 'turnitin' ? 'Turnin' : 'Drillbot AI'}
                              </p>
                              <h3 className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                                {displayName}
                              </h3>
                            </div>

                            {item.resultUrl && (
                              <button
                                onClick={(e) => handleDownload(e, item)}
                                disabled={isDownloading}
                                title="Download hasil"
                                className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                  isDownloading
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-wait'
                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                                }`}
                              >
                                {isDownloading ? (
                                  <span className="w-3 h-3 border border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Download className="w-3 h-3" /> Unduh
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                item.status === 'done'
                                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                  : item.status === 'processing'
                                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                    : item.status === 'pending'
                                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                      : item.status === 'failed'
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'
                                        : item.status === 'cancelled'
                                          ? 'bg-red-50 dark:bg-red-900/20 text-red-400 dark:text-red-500'
                                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.status === 'done'
                                    ? 'bg-emerald-400'
                                    : item.status === 'processing'
                                      ? 'bg-purple-400 animate-pulse'
                                      : item.status === 'pending'
                                        ? 'bg-blue-400'
                                        : item.status === 'failed'
                                          ? 'bg-red-400'
                                          : item.status === 'cancelled'
                                            ? 'bg-red-300'
                                            : 'bg-gray-400'
                                }`}
                              />
                              {item.statusLabel || item.status}
                            </span>

                            <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                              {item.lastUpdated || item.time}
                            </span>
                          </div>
                          {item.isDone && item.completedAt && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">
                              Selesai: {item.completedAt}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          {isDeleting ? (
                            <div
                              className="flex items-center justify-between gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-[12px] text-red-600 dark:text-red-400 font-medium flex-1 truncate">
                                Delete "{displayName}"?
                              </p>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={(e) => confirmDelete(e, item)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={cancelDelete}
                                  className="px-2.5 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  {(item.workbook_name ??
                                    (typeof item.workbook === 'string'
                                      ? item.workbook
                                      : item.workbook?.name)) && (
                                    <p className="text-[11px] text-gray-400 truncate mb-0.5">
                                      {item.workbook_name ??
                                        (typeof item.workbook === 'string'
                                          ? item.workbook
                                          : item.workbook?.name)}
                                    </p>
                                  )}

                                  {isEditing ? (
                                    <div
                                      className="flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        ref={editInputRef}
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') submitRename(e, item)
                                          if (e.key === 'Escape') cancelEditing(e)
                                        }}
                                        className="flex-1 text-[13px] font-medium bg-white dark:bg-gray-800 border border-[#4A90D9]/40 rounded-md px-2 py-0.5 outline-none text-gray-800 dark:text-gray-200 min-w-0"
                                      />
                                      <button
                                        onClick={(e) => submitRename(e, item)}
                                        className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors flex-shrink-0"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <h3
                                      className={`text-[13px] font-medium truncate transition-colors ${
                                        activeItemId === item.id
                                          ? 'text-[#4A90D9]'
                                          : 'text-gray-800 dark:text-gray-200 group-hover:text-[#4A90D9]'
                                      }`}
                                    >
                                      {displayName}
                                    </h3>
                                  )}
                                </div>

                                {!isEditing && (
                                  <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                                    {canRename && (
                                      <button
                                        onClick={(e) => startEditing(e, item)}
                                        className="p-1 rounded-md text-gray-500 hover:text-[#4A90D9] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"
                                        title="Rename"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                    )}

                                    {canDelete && (
                                      <button
                                        onClick={(e) => startDelete(e, item)}
                                        className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {!isEditing && (
                                <div className="flex justify-between">
                                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                    {chatPreview ||
                                      (typeof item.data === 'string'
                                        ? item.data.slice(0, 80)
                                        : item.preview || '')}
                                  </p>

                                  <div>
                                    {(item.time || item.lastUpdated) && (
                                      <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap mr-1">
                                        {item.lastUpdated || item.time}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />

              {/* Load more indicator */}
              {isFetchingMore && (
                <div className="px-4 py-3 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-4 w-3/4 skeleton opacity-60" />
                        <div className="h-3 w-12 skeleton opacity-40" />
                      </div>
                      <div className="h-3 w-full skeleton opacity-30" />
                    </div>
                  ))}
                </div>
              )}

              {/* End of list indicator */}
              {!hasMore && filteredItems.length >= PER_PAGE && (
                <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 py-4">
                  All history loaded
                </p>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  )
}
