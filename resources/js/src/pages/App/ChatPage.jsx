import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import ChatInput from '@/components/chat/ChatInput'
import ChatMessages from '@/components/chat/ChatMessages'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()

  /* ── AI providers — diambil dari GET /convers ── */
  const [aiProviders, setAiProviders] = useState([])
  const [selectedAiId, setSelectedAiId] = useState('')

  /* ── Conversation & messages ── */
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  /* ── Pagination ── */
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMoreChats, setHasMoreChats] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  /* ── UI ── */
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const scrollRef = useRef(null)
  const endRef = useRef(null)
  const abortRef = useRef(null)
  const suppressScrollRef = useRef(false)

  useEffect(() => {
    request('/chats')
      .then((res) => {
        const providers = Array.isArray(res) ? res : []
        if (providers.length) {
          setAiProviders(providers)
          setSelectedAiId(String(providers[0].id))
        }
      })
      .catch(() => {})
  }, [])

  /* ── /new → reset ── */
  useEffect(() => {
    if (location.pathname === '/new') {
      if (abortRef.current) abortRef.current.abort()
      setMessages([])
      setConversationId(null)
      setNextCursor(null)
      setHasMoreChats(false)
      setAttachedFiles([])
      navigate('/chat', { replace: true })
    }
    const t = setTimeout(() => setIsInitialLoading(false), 200)
    return () => clearTimeout(t)
  }, [location.pathname, navigate])

  /* ── Load isi conversation (cursor pagination) ── */
  const loadConversation = useCallback(async (convId, cursor = null, prepend = false) => {
    const url = cursor ? `/chats/${convId}?cursor=${cursor}` : `/chats/${convId}`
    const res = await request(url)

    const incoming = (res.chats ?? []).map((c) => ({
      id: c.id,
      role: c.role,
      content: c.content,
      code: c.code,
      time: c.time,
    }))

    if (prepend) {
      const container = scrollRef.current
      const prevHeight = container?.scrollHeight ?? 0
      setMessages((prev) => [...incoming, ...prev])
      requestAnimationFrame(() => {
        if (container) container.scrollTop = container.scrollHeight - prevHeight
      })
    } else {
      setMessages(incoming)
    }

    setNextCursor(res.nextCursor ?? null)
    setHasMoreChats(res.hasMoreChats ?? false)
    return res
  }, [])

  /* ── Listener RightSidebar → load conversation ──
     Data ai provider sudah ada di GET /convers,
     jadi kita pakai aiProviders yang sudah di-set RightSidebar via event  ── */
  useEffect(() => {
    const handler = async (e) => {
      const conv = e.detail
      if (!conv?.id) return

      setIsLoadingHistory(true)
      setMessages([])
      setConversationId(conv.id)

      // Set AI providers dari data conversation (sudah dipass dari sidebar)
      if (conv.ai?.length) {
        setAiProviders(conv.ai)
        setSelectedAiId(String(conv.ai[0].id))
      }

      if (conv.chats?.length) {
        setMessages(
          conv.chats.map((c) => ({
            id: c.id,
            role: c.role,
            content: c.content,
            code: c.code,
            time: c.time,
          })),
        )
        setNextCursor(conv.nextCursor ?? null)
        setHasMoreChats(conv.hasMoreChats ?? false)
      } else {
        await loadConversation(conv.id)
      }

      setIsLoadingHistory(false)
      suppressScrollRef.current = false
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    }

    window.addEventListener('loadHistoryChat', handler)
    return () => window.removeEventListener('loadHistoryChat', handler)
  }, [loadConversation])

  /* ── Auto-scroll ── */
  useEffect(() => {
    if (!suppressScrollRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

  /* ── Infinite scroll ── */
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = async () => {
      if (el.scrollTop > 120 || !hasMoreChats || isLoadingMore || !conversationId || !nextCursor)
        return
      suppressScrollRef.current = true
      setIsLoadingMore(true)
      await loadConversation(conversationId, nextCursor, true)
      setIsLoadingMore(false)
      setTimeout(() => {
        suppressScrollRef.current = false
      }, 500)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [hasMoreChats, isLoadingMore, conversationId, nextCursor, loadConversation])

  /* ── Kirim pesan ── */
  const handleSendMessage = async () => {
    const text = inputValue.trim()
    if (!text && !attachedFiles.length) return
    if (!selectedAiId) {
      showSnackbar('error', 'Pilih model AI terlebih dahulu')
      return
    }
    if (isStreaming) return

    const files = [...attachedFiles]
    setInputValue('')
    setAttachedFiles([])

    /* Buat conversation baru jika belum ada */
    let convId = conversationId
    if (!convId) {
      try {
        const res = await request('/convers', { method: 'POST', body: { content: text } })
        convId = res.conversation.id
        setConversationId(convId)
        window.dispatchEvent(new CustomEvent('conversationCreated', { detail: res.conversation }))
      } catch (err) {
        showSnackbar('error', err.message || 'Gagal membuat percakapan')
        setInputValue(text)
        return
      }
    }

    /* Tambah pesan user ke UI */
    const tempId = `temp-${Date.now()}`
    const userMsg = {
      id: tempId,
      role: 'user',
      content: text,
      files,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])

    /* Konteks 10 pesan terakhir */
    const contextMessages = [...messages, userMsg]
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    /* ── SSE Streaming ── */
    setIsStreaming(true)
    setStreamingContent('')
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    try {
      // console.log(userMsg)
      // console.log(text)
      // console.log(contextMessages)

      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          providerId: parseInt(selectedAiId),
          conversationId: convId,
          message: text,
          messageToAi: contextMessages,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.message || 'Generate gagal')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullContent += decoder.decode(value, { stream: true })
        setStreamingContent(fullContent)
      }

      /* Commit pesan assistant */
      const ai = aiProviders.find((a) => String(a.id) === selectedAiId)
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          code: ai?.code ?? null,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setStreamingContent('')
    } catch (err) {
      if (err.name === 'AbortError') return
      showSnackbar('error', err.message || 'Gagal mengirim pesan')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setInputValue(text)
    } finally {
      setIsStreaming(false)
    }
  }

  /* ── File helpers ── */
  const handleFileAdd = (files) => {
    setAttachedFiles((prev) => {
      const next = [...prev, ...files]
      if (next.length > 3) {
        showSnackbar('error', 'Maksimal 3 file')
        return next.slice(0, 3)
      }
      return next
    })
  }
  const handleFileRemove = (i) => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))

  const canSend = Boolean(
    (inputValue.trim() || attachedFiles.length > 0) && selectedAiId && !isStreaming,
  )

  return (
    <div className="flex flex-col h-[100vh] bg-[#f7f7f5] dark:bg-[#0f141e] transition-colors duration-300">
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-4 md:pt-8 px-4">
        <ChatMessages
          messages={messages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          isInitialLoading={isInitialLoading}
          isLoadingHistory={isLoadingHistory}
          isLoadingMore={isLoadingMore}
          userName={user?.name}
          endRef={endRef}
        />
      </div>

      {isInitialLoading ? (
        <div className="sticky bottom-0 pt-2 bg-[#f7f7f5] dark:bg-[#0f141e] px-4">
          <div className="max-w-3xl mx-auto w-full bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50">
            <div className="px-5 pt-4 pb-2 space-y-2.5">
              <div className="h-3.5 w-[55%] skeleton rounded-full" />
              <div className="h-3.5 w-[35%] skeleton rounded-full" />
            </div>

            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full skeleton" />
                <div className="w-[100px] h-8 rounded-full skeleton" />
              </div>
              <div className="w-9 h-9 rounded-full skeleton" />
            </div>
          </div>

          <div className="max-w-3xl mx-auto my-2 flex justify-center">
            <div className="h-3 w-[280px] skeleton rounded-full" />
          </div>
        </div>
      ) : (
        <ChatInput
          inputValue={inputValue}
          onInputChange={setInputValue}
          attachedFiles={attachedFiles}
          onRemoveFile={handleFileRemove}
          showAttachMenu={showAttachMenu}
          onToggleAttachMenu={() => setShowAttachMenu((v) => !v)}
          onFileChange={handleFileAdd}
          aiProviders={aiProviders}
          selectedAiId={selectedAiId}
          onAiChange={setSelectedAiId}
          canSend={canSend}
          onSubmit={handleSendMessage}
          isStreaming={isStreaming}
        />
      )}
    </div>
  )
}
