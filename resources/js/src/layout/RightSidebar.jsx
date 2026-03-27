import {
  Check,
  Clock,
  FileText,
  Hash,
  MessagesSquare,
  Mic,
  Pencil,
  Plus,
  Trash2,
  Wand2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { request } from '@/utils/Http'

const PAGE_CONFIG = {
  '/chat': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/new': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/writer': { title: 'Saved Document', icon: FileText, apiPath: '/writers' },
  '/humanizer': { title: 'History Humanizer AI', icon: Wand2, apiPath: '/humans' },
  '/paraphrase': { title: 'History Paraphrase AI', icon: Hash, apiPath: '/paraps' },
  '/transcribe': { title: 'History Transcribe AI', icon: Mic, apiPath: '/transcribes' },
}

// Which routes support rename (PUT /{id})
const RENAME_SUPPORTED = ['/chat', '/new', '/writer', '/paraphrase', '/humanizer', '/transcribe']

// Which routes support delete
const DELETE_SUPPORTED = ['/chat', '/new', '/writer', '/paraphrase', '/humanizer', '/transcribe']

// API prefix per route
const API_PREFIX = {
  '/chat': '/convers',
  '/new': '/convers',
  '/writer': '/documents',
  '/paraphrase': '/paraps',
  '/humanizer': '/humans',
  '/transcribe': '/transcribes',
}

export default function RightSidebar() {
  const { isOpen, close } = useRightSidebar()
  const { showSnackbar } = useSnackbar()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState([])
  const [workbooks, setWorkbooks] = useState([])
  const [activeWorkbook, setActiveWorkbook] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [editingValue, setEditingValue] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [activeItemId, setActiveItemId] = useState(null)

  const editInputRef = useRef(null)

  const current = PAGE_CONFIG[location.pathname] || { title: 'Riwayat', icon: Clock, apiPath: null }
  const IconComponent = current.icon
  const canRename = RENAME_SUPPORTED.includes(location.pathname)
  const canDelete = DELETE_SUPPORTED.includes(location.pathname)
  const apiPrefix = API_PREFIX[location.pathname]

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setActiveWorkbook('all')
      setEditingId(null)
      setDeletingId(null)

      return
    }

    if (location.pathname === '/writer') {
      setIsLoading(true)
      setHistoryItems([])
      request('/writers')
        .then((res) => {
          setHistoryItems(Array.isArray(res.documents) ? res.documents : [])
          setWorkbooks(Array.isArray(res.workbooks) ? res.workbooks : [])
        })
        .catch(() => setHistoryItems([]))
        .finally(() => setIsLoading(false))
      return
    }

    if (!current.apiPath) {
      setHistoryItems([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setHistoryItems([])
    request(current.apiPath)
      .then((res) => {
        const items = Array.isArray(res) ? res : Array.isArray(res.data) ? res.data : []
        setHistoryItems(items)
      })
      .catch(() => setHistoryItems([]))
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, location.pathname])

  useEffect(() => {
    const handler = (e) => {
      setHistoryItems((prev) => [
        {
          id: e.detail.id,
          title: e.detail.title || 'New Conversation',
          lastUpdated: e.detail.lastUpdated || 'Baru saja',
          chats: [],
          nextCursor: null,
          hasMoreChats: false,
          ai: [],
        },
        ...prev,
      ])
    }
    window.addEventListener('conversationCreated', handler)
    return () => window.removeEventListener('conversationCreated', handler)
  }, [])

  // Listen event dari pages untuk set active item
  useEffect(() => {
    const handlers = {
      // Chat: conversation baru dibuat
      conversationCreated: (e) => {
        if (location.pathname !== '/chat' && location.pathname !== '/new') return
        const conv = e.detail
        setHistoryItems((prev) => {
          // Cegah duplikat
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

      // Writer: document disave
      documentSaved: (e) => {
        if (location.pathname !== '/writer') return
        const doc = e.detail // { id, name, workbook, workbook_id, lastEdited }
        setHistoryItems((prev) => {
          const exists = prev.some((h) => h.id === doc.id)
          if (exists) {
            // Update nama jika sudah ada (re-save)
            return prev.map((h) => (h.id === doc.id ? { ...h, ...doc } : h))
          }
          return [doc, ...prev]
        })
        setActiveItemId(doc.id)
      },

      // Paraphrase: history baru
      paraphraseCompleted: (e) => {
        if (location.pathname !== '/paraphrase') return
        const item = e.detail
        setHistoryItems((prev) => {
          if (prev.some((h) => h.id === item.id)) return prev
          return [item, ...prev]
        })
        setActiveItemId(item.id)
      },

      // Transcribe: history baru
      transcribeCompleted: (e) => {
        if (location.pathname !== '/transcribe') return
        const item = e.detail
        setHistoryItems((prev) => {
          if (prev.some((h) => h.id === item.id)) return prev
          return [item, ...prev]
        })
        setActiveItemId(item.id)
      },
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [location.pathname])

  // Focus input when editing starts
  useEffect(() => {
    if (editingId !== null) {
      setTimeout(() => editInputRef.current?.focus(), 50)
    }
  }, [editingId])

  const filteredItems = useMemo(() => {
    let items = historyItems

    if (activeWorkbook !== 'all') {
      items = items.filter((doc) => {
        const docWorkbookName =
          doc.workbook_name ??
          (typeof doc.workbook === 'string' ? doc.workbook : doc.workbook?.name) ??
          null

        const matchedWorkbook = workbooks.find((wb) => wb.name === activeWorkbook)

        if (docWorkbookName !== null) {
          return docWorkbookName === activeWorkbook
        }

        if (matchedWorkbook && doc.workbook_id !== undefined) {
          return String(doc.workbook_id) === String(matchedWorkbook.id)
        }

        return false
      })
    }

    if (!searchQuery.trim()) return items

    return items.filter((item) =>
      (item.name || item.title || '').toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [historyItems, searchQuery, activeWorkbook, workbooks])

  // ─── HANDLERS ────────────────────────────────────────────────

  const handleItemClick = (item) => {
    // Don't navigate if editing or showing delete confirm
    if (editingId === item.id || deletingId === item.id) return

    setActiveItemId(item.id)

    if (location.pathname === '/chat' || location.pathname === '/new') {
      window.dispatchEvent(
        new CustomEvent('loadHistoryChat', {
          detail: {
            id: item.id,
            title: item.title,
            chats: item.chats ?? [],
            nextCursor: item.nextCursor ?? null,
            hasMoreChats: item.hasMoreChats ?? false,
          },
        }),
      )
      close()
      return
    }

    if (location.pathname === '/writer') {
      window.dispatchEvent(new CustomEvent('loadHistoryWriter', { detail: item }))
      close()
      return
    }

    if (location.pathname === '/paraphrase') {
      window.dispatchEvent(new CustomEvent('loadHistoryParaphrase', { detail: item }))
      close()
      return
    }

    if (location.pathname === '/transcribe') {
      window.dispatchEvent(new CustomEvent('loadHistoryTranscribe', { detail: item }))
      close()
      return
    }

    if (location.pathname === '/humanizer') {
      window.dispatchEvent(new CustomEvent('loadHistoryHumanizer', { detail: item }))
      close()
      return
    }
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

      // Notify page if currently loaded item was renamed
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

      // Notify page
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

  // ─── WORKBOOK DELETE ─────────────────────────────────────────

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

  // ─── WORKBOOK ADD ─────────────────────────────────────────────

  const [addingWorkbook, setAddingWorkbook] = useState(false)
  const [newWorkbookName, setNewWorkbookName] = useState('')

  const submitNewWorkbook = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const name = newWorkbookName.trim()
    if (!name) return
    try {
      await request('/workbooks', {
        method: 'POST',
        body: { name },
      })
      // Re-fetch workbooks to get new id
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

  // ─── RENDER ──────────────────────────────────────────────────

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-80 transition-opacity" onClick={close} />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-[340px] bg-white dark:bg-[#090d16] z-90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100 dark:border-gray-800">
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
        <div className="flex flex-col border-b border-gray-50 dark:border-gray-800">
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
            filteredItems.map((item) => {
              const lastChat = item.chats?.at(-1)
              const chatPreview = lastChat?.content?.slice(0, 70) ?? ''
              const isEditing = editingId === item.id
              const isDeleting = deletingId === item.id
              const displayName = item.title || item.name || 'New Conversation'

              return (
                <div className="px-2" key={item.id}>
                  <div
                    onClick={() => handleItemClick(item)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors group border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer
                      ${
                        isDeleting
                          ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/30'
                          : activeItemId === item.id
                            ? 'bg-[#eeedeb] dark:bg-gray-900'
                            : 'hover:bg-[#eeedeb] dark:hover:bg-gray-900'
                      }`}
                  >
                    {/* Delete confirm banner */}
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
                            {/* Workbook tag */}
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

                            {/* Editable title */}
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
                                className={`text-[13px] font-medium truncate transition-colors
                                ${
                                  activeItemId === item.id
                                    ? 'text-[#4A90D9]'
                                    : 'text-gray-800 dark:text-gray-200 group-hover:text-[#4A90D9]'
                                }`}
                              >
                                {displayName}
                              </h3>
                            )}
                          </div>

                          {/* Right side: timestamp + action buttons */}
                          {!isEditing && (
                            <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                              {/* Edit button */}
                              {canRename && (
                                <button
                                  onClick={(e) => startEditing(e, item)}
                                  className="p-1 rounded-md text-gray-300 hover:text-[#4A90D9] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all opacity-0 group-hover:opacity-100"
                                  title="Rename"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              )}

                              {/* Delete button */}
                              {canDelete && (
                                <button
                                  onClick={(e) => startDelete(e, item)}
                                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Preview */}
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
                  </div>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
