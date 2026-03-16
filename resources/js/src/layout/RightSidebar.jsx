import { Clock, FileText, Hash, MessagesSquare, Mic, Plus, Trash2, Wand2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
import { request } from '@/utils/Http'

const PAGE_CONFIG = {
  '/chat': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/new': { title: 'History Chat', icon: MessagesSquare, apiPath: '/convers' },
  '/writer': { title: 'Saved Document', icon: FileText, apiPath: '/writers' },
  '/humanizer': { title: 'History Humanizer AI', icon: Wand2, apiPath: null },
  '/paraphrase': { title: 'History Paraphrase AI', icon: Hash, apiPath: '/paraps' },
  '/transcribe': { title: 'History Transcribe AI', icon: Mic, apiPath: '/transcribes' },
}

export default function RightSidebar() {
  const { isOpen, close } = useRightSidebar()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState([])
  const [workbooks, setWorkbooks] = useState([])
  const [activeWorkbook, setActiveWorkbook] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const current = PAGE_CONFIG[location.pathname] || { title: 'Riwayat', icon: Clock, apiPath: null }
  const IconComponent = current.icon

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setActiveWorkbook('all')
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

  const handleItemClick = (item) => {
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

      console.log(item)
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
  }

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
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
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
                    <button
                      className="w-full flex items-center justify-start gap-2 px-2.5 py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <Plus className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      Add New Workbook
                    </button>
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

              return (
                <div className="px-2" key={item.id}>
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full text-left px-3 py-2.5 hover:bg-[#eeedeb] dark:hover:bg-gray-900 rounded-xl transition-colors group border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13px] font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#4A90D9] transition-colors truncate flex-1">
                        <p className="text-gray-400">
                          {item.workbook_name ??
                            (typeof item.workbook === 'string'
                              ? item.workbook
                              : item.workbook?.name) ??
                            ''}
                        </p>
                        {item.title || item.name || 'New Conversation'}
                      </h3>
                      {(item.time || item.lastUpdated) && (
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 mt-0.5">
                          {item.lastUpdated || item.time}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                      {chatPreview ||
                        (typeof item.data === 'string'
                          ? item.data.slice(0, 80)
                          : item.preview || '')}
                    </p>
                  </button>
                </div>
              )
            })
          )}
        </div>
      </aside>
    </>
  )
}
