import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ChatInput from '@/components/chat/ChatInput'
import ChatMessages from '@/components/chat/ChatMessages'
import PromptLibraryModal from '@/components/writer/PromptModal'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useQuota } from '@/hooks/useQuota'
import { request } from '@/utils/Http'

const MAX_FILE_SIZE = 50 * 1024 * 1024

const extractErrorMessage = (raw) => {
  try {
    const json = JSON.parse(raw.trim())
    if (json?.error?.message) return json.error.message
    if (json?.message) return json.message
    // eslint-disable-next-line no-unused-vars, no-empty
  } catch (_) {}
  return null
}

const parseSseContent = (raw) => {
  if (!raw.includes('data: ')) return raw
  let result = ''
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
    try {
      const json = JSON.parse(line.slice(6))
      const delta = json?.choices?.[0]?.delta?.content
      if (delta) result += delta
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) result += text
      // eslint-disable-next-line no-unused-vars, no-empty
    } catch (_) {}
  }
  return result || raw
}

const parseGffSse = (raw) => {
  let content = ''
  let annotations = []
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue
    try {
      const json = JSON.parse(line.slice(6))
      if (json?.delta) content += json.delta
      if (json?.done && Array.isArray(json.annotations)) annotations = json.annotations
      // eslint-disable-next-line no-unused-vars, no-empty
    } catch (_) {}
  }
  return { content, annotations }
}

const readStream = async (response, onProgress) => {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullRaw = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    fullRaw += chunk
    const trimmed = fullRaw.trim()
    if (trimmed.startsWith('{') && !trimmed.includes('data: ')) {
      const errMsg = extractErrorMessage(trimmed)
      if (errMsg) throw new Error(errMsg)
    }
    onProgress(fullRaw)
  }
  const trimmed = fullRaw.trim()
  if (trimmed.startsWith('{') && !trimmed.includes('data: ')) {
    const errMsg = extractErrorMessage(trimmed)
    if (errMsg) throw new Error(errMsg)
  }
  return fullRaw
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const classifyFiles = (files) => {
  const images = files.filter((f) => IMAGE_TYPES.includes(f.type))
  const docs = files.filter((f) => !IMAGE_TYPES.includes(f.type))
  return { images, docs }
}

export default function ChatPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { id: urlId } = useParams()

  const { user, me } = useAuth()
  const { showSnackbar } = useSnackbar()
  const { initQuota, decrement, rollback, getQuota } = useQuota()

  const [aiProviders, setAiProviders] = useState([])
  const [papers, setPapers] = useState([])
  const [allSections, setAllSections] = useState([])
  const [promptOpen, setPromptOpen] = useState(false)
  const [selectedAiId, setSelectedAiId] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [nextCursor, setNextCursor] = useState(null)
  const [hasMoreChats, setHasMoreChats] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const scrollRef = useRef(null)
  const endRef = useRef(null)
  const abortRef = useRef(null)
  const suppressScrollRef = useRef(false)

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    request('/chats')
      .then((res) => {
        setAiProviders(res?.ai)
        setPapers(res?.papers)
        setAllSections(res?.sections)
        initQuota(res?.quota)
        setSelectedAiId(String(res?.ai[0].id))
      })
      .catch(() => {})
  }, [initQuota])

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

  const loadConversation = useCallback(async (convId, cursor = null, prepend = false) => {
    const url = cursor ? `/chats/${convId}?cursor=${cursor}` : `/chats/${convId}`
    const res = await request(url)
    const incoming = (res.chats ?? []).map((c) => ({
      id: c.id,
      role: c.role,
      content: c.content,
      code: c.code,
      annotations: c.annotations ?? [],
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

  useEffect(() => {
    if (urlId && String(urlId) !== String(conversationId)) {
      setIsLoadingHistory(true)
      setConversationId(Number(urlId))
      setMessages([])
      loadConversation(urlId).finally(() => {
        setIsLoadingHistory(false)
        suppressScrollRef.current = false
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      })
    } else if (!urlId && location.pathname !== '/new' && conversationId !== null) {
      setConversationId(null)
      setMessages([])
    }
  }, [urlId, conversationId, loadConversation, location.pathname])

  // Support the loadHistoryChat event for RightSidebar navigation
  useEffect(() => {
    const handler = async (e) => {
      const conv = e.detail
      if (!conv?.id) return
      
      // If we are already on this conversation, do nothing
      if (String(conv.id) === String(urlId)) return
      
      // If chats are provided (e.g. from RightSidebar), we can pre-populate them
      if (conv.chats?.length) {
        setIsLoadingHistory(true)
        setConversationId(conv.id)
        setMessages(
          conv.chats.map((c) => ({
            id: c.id,
            role: c.role,
            content: c.content,
            code: c.code,
            annotations: c.annotations ?? [],
            time: c.time,
          }))
        )
        setNextCursor(conv.nextCursor ?? null)
        setHasMoreChats(conv.hasMoreChats ?? false)
        setIsLoadingHistory(false)
        suppressScrollRef.current = false
        setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      }
      
      // Navigate to the chat URL so the useParams effect handles the loading if chats weren't provided
      navigate(`/chat/${conv.id}`)
    }
    window.addEventListener('loadHistoryChat', handler)
    return () => window.removeEventListener('loadHistoryChat', handler)
  }, [urlId, navigate])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (!e.detail.path.startsWith('/chat') && e.detail.path !== '/new') return
      if (e.detail.id === conversationId) {
        setMessages([])
        setConversationId(null)
        setNextCursor(null)
        setHasMoreChats(false)
        setAttachedFiles([])
        setInputValue('')
      }
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [conversationId])

  useEffect(() => {
    if (!suppressScrollRef.current) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, streamingContent])

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

  const sendTextMessage = async (convId, text, contextMessages) => {
    const selectedProvider = aiProviders.find((ai) => String(ai.id) === String(selectedAiId))
    const code = selectedProvider?.code
    decrement(code)

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

    if (response.status === 429) {
      throw new Error('Batas harian tercapai, coba lagi besok!')
    }

    if (!response.ok) {
      rollback(code)
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Generate gagal')
    }

    const fullRaw = await readStream(response, (raw) => {
      setStreamingContent(parseSseContent(raw))
    })

    return { content: parseSseContent(fullRaw), annotations: [] }
  }

  const sendFileMessage = async (convId, text, files) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)

    if (oversized.length) {
      throw new Error(
        `File "${oversized[0].name}" melebihi batas ukuran ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      )
    }

    const form = new FormData()
    form.append('providerId', selectedAiId)
    form.append('conversationId', convId)
    form.append('message', text)
    files.forEach((f) => form.append('files[]', f))

    const response = await fetch('/api/chats/gff', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: form,
      signal: abortRef.current.signal,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Generate gagal')
    }

    const contentType = response.headers.get('Content-Type') ?? ''
    if (contentType.includes('text/event-stream')) {
      const fullRaw = await readStream(response, (raw) => {
        const { content } = parseGffSse(raw)
        setStreamingContent(content)
      })
      return parseGffSse(fullRaw)
    }

    const json = await response.json()
    if (json?.error) throw new Error(json.error.message || 'AI provider error')
    if (!json?.reply && json?.message) throw new Error(json.message)
    const reply = json.reply ?? ''

    setStreamingContent(reply)

    return { content: reply, annotations: [] }
  }

  const handleSendMessage = async (mode = 'chat', options = {}) => {
    let text = inputValue.trim()

    if (!text && !attachedFiles.length) return

    if (!selectedAiId) {
      showSnackbar('error', 'Pilih model AI terlebih dahulu')
      return
    }

    if (isStreaming) return

    if (mode === 'image') {
      if (!text.match(/buat|bikin|gambar|create|lukis|foto|potret|generate/i)) {
        text = "Buatkan gambar: " + text
      }
      if (options.imageStyle && options.imageStyle !== 'Auto') text += ` --style ${options.imageStyle}`
      if (options.imageOption === 'Kecepatan') text += ` --quality fast`
      if (options.aspectRatio) text += ` --ar ${options.aspectRatio}`
    } else if (mode === 'video') {
      if (!text.match(/buat|bikin|video|create/i)) {
        text = "Buatkan video: " + text
      }
      if (options.videoRes && options.videoRes !== '720p') text += ` --resolution ${options.videoRes}`
      if (options.videoDuration && options.videoDuration !== '6s') text += ` --duration ${options.videoDuration}`
      if (options.aspectRatio) text += ` --ar ${options.aspectRatio}`
    } else if (mode === 'music' && !text.match(/buat|bikin|lagu|musik|create/i)) {
      text = "Buatkan lagu: " + text
    }

    const files = [...attachedFiles]

    setInputValue('')
    setAttachedFiles([])

    let convId = conversationId
    let isNewConv = false
    if (!convId) {
      try {
        const res = await request('/convers', { method: 'POST' })
        convId = res.conversation.id
        isNewConv = true
        setConversationId(convId)
        window.dispatchEvent(new CustomEvent('conversationCreated', { detail: res.conversation }))
        
        // Optimistically rename the conversation to match the backend logic (first 40 chars of prompt)
        let newTitle = text.trim().replace(/\s+/g, ' ').substring(0, 40)
        if (!newTitle) newTitle = 'Percakapan Baru'
        window.dispatchEvent(new CustomEvent('conversationRenamed', { 
          detail: { id: convId, title: newTitle } 
        }))
        navigate(`/chat/${convId}`, { replace: true })
      } catch (err) {
        showSnackbar('error', err.message || 'Gagal membuat percakapan')
        setInputValue(text)
        return
      }
    }

    const { images, docs } = classifyFiles(files)
    const imageBase64Map = {}

    if (images.length > 0) {
      const base64Results = await Promise.all(images.map(fileToBase64))
      images.forEach((img, idx) => {
        imageBase64Map[img.name + img.size] = base64Results[idx]
      })
    }

    const fileMeta = files.map((f) => {
      const isImage = IMAGE_TYPES.includes(f.type)
      return {
        name: f.name,
        type: f.type,
        isImage,
        base64: isImage ? imageBase64Map[f.name + f.size] : null,
      }
    })

    const tempId = `temp-${Date.now()}`
    const userMsg = {
      id: tempId,
      role: 'user',
      content: text,
      fileMeta,
      annotations: [],
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])

    const contextMessages = [...messages, userMsg]
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }))

    if (messages.length === 0) {
      let newTitle = text.trim().replace(/\s+/g, ' ')
      if (!newTitle && files.length > 0) {
        newTitle = 'File: ' + files[0].name
      } else if (!newTitle) {
        newTitle = 'Percakapan Baru'
      }
      newTitle = newTitle.slice(0, 40)
      window.dispatchEvent(
        new CustomEvent('conversationRenamed', { detail: { id: convId, title: newTitle } })
      )
    }

    setIsStreaming(true)
    setStreamingContent('')

    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    try {
      let result

      if (files.length > 0) {
        if (docs.length > 0) {
          result = await sendFileMessage(convId, text, files)
        } else {
          const preResolvedBase64 = images.map((img) => imageBase64Map[img.name + img.size])
          const prevContext = contextMessages.slice(0, -1)

          const userContentParts = [
            { type: 'text', text },
            ...preResolvedBase64.map((b64) => ({
              type: 'image_url',
              image_url: { url: b64 },
            })),
          ]

          const messagesPayload = [...prevContext, { role: 'user', content: userContentParts }]
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
              messageToAi: messagesPayload,
            }),
            signal: abortRef.current.signal,
          })

          if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            throw new Error(err.message || 'Generate gagal')
          }

          const fullRaw = await readStream(response, (raw) => {
            setStreamingContent(parseSseContent(raw))
          })

          result = { content: parseSseContent(fullRaw), annotations: [] }
        }
      } else {
        result = await sendTextMessage(convId, text, contextMessages)
      }

      const ai = aiProviders.find((a) => String(a.id) === selectedAiId)

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.content,
          annotations: result.annotations ?? [],
          code: ai?.code ?? null,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ])

      // Refresh the user profile to update quota/token balance
      me()

      setStreamingContent('')
    } catch (err) {
      if (err.name === 'AbortError') return
      setStreamingContent('')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setInputValue(text)
      setAttachedFiles(files)
      showSnackbar('error', err.message || 'Gagal mengirim pesan')
    } finally {
      setIsStreaming(false)
    }
  }

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
      {/* pb-44 memberi ruang untuk ChatInput yang fixed di bawah */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-4 md:pt-8 px-6 pb-44">
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
        /* Skeleton juga pakai fixed + max-w-3xl supaya sama posisinya */
        <div
          className="fixed bottom-0 right-0 transition-all duration-300 ease-in-out"
          style={{
            left: isMobile ? '10px' : 'var(--sidebar-w, 64px)',
            right: isMobile ? '10px' : '',
          }}
        >
          <div className="max-w-3xl mx-auto w-full">
            <div className="bg-white dark:bg-gray-800 rounded-[32px] border border-gray-200/60 dark:border-gray-700/50">
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
            <div className="my-2 text-center">
              <div className="h-3 w-[280px] skeleton rounded-full mx-auto" />
            </div>
          </div>
        </div>
      ) : (
        <ChatInput
          inputValue={inputValue}
          onPromptLibraryOpen={() => setPromptOpen(true)}
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
          getQuota={getQuota}
        />
      )}

      <PromptLibraryModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onSelect={setInputValue}
        inputValue={inputValue}
        isChat={true}
        papers={papers}
        sections={allSections}
      />
    </div>
  )
}
