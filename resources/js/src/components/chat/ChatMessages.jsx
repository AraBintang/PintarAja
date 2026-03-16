import { Check, Copy, FileText, Hash, Mic, Paperclip, Speech } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AI_CODE_MAP } from '@/assets/ai'

const CHAT_FEATURES = [
  { label: 'AI Writer', iconColor: 'text-blue-500', to: '/writer', icon: <FileText /> },
  { label: 'Paraphrase AI', iconColor: 'text-green-500', to: '/paraphrase', icon: <Hash /> },
  { label: 'Humanizer AI', iconColor: 'text-orange-500', to: '/humanize', icon: <Speech /> },
  { label: 'Transcribe AI', iconColor: 'text-purple-500', to: '/transcribe', icon: <Mic /> },
]

/* ─── Copy button untuk code block ─── */
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

/* ─── Code block component ─── */
function CodeBlock({ lang, code }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-[13px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 border-b border-gray-700">
        <span className="text-[11px] font-mono font-semibold text-gray-400 uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <CopyButton code={code} />
      </div>
      {/* Code */}
      <pre className="bg-[#f7f7f5] dark:bg-[#0f141e] px-4 py-3 overflow-x-auto leading-relaxed">
        <code className="font-mono text-[13px] whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

/* ─── Inline code ─── */
function InlineCode({ children }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-[13px]">
      {children}
    </code>
  )
}

/* ─── Parse dan render markdown + code blocks ─── */
function MessageContent({ content }) {
  const raw = String(content)

  // Split berdasarkan code block (```lang\n...\n```)
  const parts = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    // Teks sebelum code block
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: raw.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', lang: match[1] || '', code: match[2] })
    lastIndex = match.index + match[0].length
  }

  // Sisa teks setelah code block terakhir
  if (lastIndex < raw.length) {
    parts.push({ type: 'text', content: raw.slice(lastIndex) })
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: raw })
  }

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return <CodeBlock key={i} lang={part.lang} code={part.code} />
        }
        return <InlineTextContent key={i} content={part.content} />
      })}
    </>
  )
}

/* ─── Render teks biasa dengan inline markdown ─── */
function InlineTextContent({ content }) {
  // Split per baris untuk handle heading, list, dll
  const lines = content.split('\n')

  return (
    <span className="whitespace-pre-wrap break-words">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1

        // ### Heading 3
        if (line.startsWith('### ')) {
          return (
            <span key={i}>
              <strong className="block text-[15px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                {renderInline(line.slice(4))}
              </strong>
              {!isLast && ''}
            </span>
          )
        }

        // ## Heading 2
        if (line.startsWith('## ')) {
          return (
            <span key={i}>
              <strong className="block text-[16px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                {renderInline(line.slice(3))}
              </strong>
              {!isLast && ''}
            </span>
          )
        }

        // # Heading 1
        if (line.startsWith('# ')) {
          return (
            <span key={i}>
              <strong className="block text-[17px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1">
                {renderInline(line.slice(2))}
              </strong>
              {!isLast && ''}
            </span>
          )
        }

        // List item - atau *
        if (/^[-*] /.test(line)) {
          return (
            <span key={i} className="flex gap-2 my-0.5">
              <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
              <span>{renderInline(line.slice(2))}</span>
              {!isLast && ''}
            </span>
          )
        }

        // Numbered list
        if (/^\d+\. /.test(line)) {
          const numMatch = line.match(/^(\d+)\. (.*)/)
          if (numMatch) {
            return (
              <span key={i} className="flex gap-2 my-0.5">
                <span className="text-gray-400 flex-shrink-0 min-w-[1.5rem] text-right">
                  {numMatch[1]}.
                </span>
                <span>{renderInline(numMatch[2])}</span>
                {!isLast && ''}
              </span>
            )
          }
        }

        // Baris biasa
        return (
          <span key={i}>
            {renderInline(line)}
            {!isLast && '\n'}
          </span>
        )
      })}
    </span>
  )
}

/* ─── Render inline markdown: bold, italic, inline code ─── */
function renderInline(text) {
  const parts = []
  // Regex: `code`, **bold**, *italic*
  const regex = /`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let m

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))

    if (m[1] !== undefined) {
      parts.push(<InlineCode key={m.index}>{m[1]}</InlineCode>)
    } else if (m[2] !== undefined) {
      parts.push(
        <strong key={m.index} className="font-semibold text-gray-800 dark:text-gray-100">
          {m[2]}
        </strong>,
      )
    } else if (m[3] !== undefined) {
      parts.push(<em key={m.index}>{m[3]}</em>)
    }

    last = m.index + m[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

/* ─── Message bubble ─── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'

  // Deteksi apakah pesan user punya file JSON-encoded (dari generateFromFile)
  let userContent = msg.content
  let userFiles = msg.files ?? []
  try {
    const parsed = JSON.parse(msg.content)
    if (Array.isArray(parsed)) {
      const textPart = parsed.find((p) => p.type === 'text')
      const fileParts = parsed.filter((p) => p.type === 'file' || p.type === 'image_base64')
      if (textPart) userContent = textPart.text
      if (fileParts.length)
        userFiles = fileParts.map((p) => ({ name: p.name ?? p.filename ?? 'file' }))
    }
    // eslint-disable-next-line no-empty, no-unused-vars
  } catch (_) {}

  return (
    <div className={`flex flex-col w-full ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-tl-none'
        }`}
      >
        {/* File attachments */}
        {userFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {userFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[12px] font-medium truncate max-w-[150px]">{f.name}</span>
              </div>
            ))}
          </div>
        )}

        <MessageContent content={userContent} />

        {/* Footer AI label */}
        {!isUser && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-1.5 opacity-50">
            {msg.code && AI_CODE_MAP[msg.code] && (
              <>
                <span className="w-3.5 h-3.5 flex-shrink-0">{AI_CODE_MAP[msg.code].icon}</span>
                <span className="text-[11px] font-semibold">{AI_CODE_MAP[msg.code].label}</span>
              </>
            )}
            {msg.time && <span className="text-[11px] ml-auto">{msg.time}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Streaming bubble ─── */
function StreamingBubble({ content }) {
  return (
    <div className="flex flex-col w-full items-start">
      <div className="max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-tl-none">
        {content ? (
          <>
            <MessageContent content={content} />
            <span className="inline-block w-1.5 h-4 bg-gray-400 rounded-sm ml-0.5 animate-pulse align-middle" />
          </>
        ) : (
          <span className="flex gap-1 py-1">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Empty state ─── */
function EmptyState({ userName }) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 tracking-tight">
        Hi <span className="gradient-name">{userName}</span>, What can we help you with today
      </h1>
      <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-6">
        {CHAT_FEATURES.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all group"
          >
            <span className={`${item.iconColor} group-hover:scale-110 transition-transform`}>
              {item.icon}
            </span>
            <span className="text-[14px] font-medium text-gray-700 dark:text-gray-200">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}

function SkeletonMessages() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className={`flex flex-col w-full ${i % 2 === 0 ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[75%] px-4 py-4 rounded-2xl shadow-sm space-y-2 ${
              i % 2 === 0
                ? 'bg-[#eeedeb] dark:bg-gray-800 rounded-tr-none'
                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none w-full'
            }`}
          >
            <div className={`h-4 skeleton rounded-md ${i % 2 === 0 ? 'w-24' : 'w-3/4'}`} />
            {i % 2 !== 0 && (
              <>
                <div className="h-4 w-full skeleton rounded-md opacity-60" />
                <div className="h-4 w-4/6 skeleton rounded-md opacity-40" />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function InitialSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="h-8 w-72 skeleton rounded-xl mx-auto" />
      <div className="grid grid-cols-2 gap-4 max-w-2xl px-6 mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-xl opacity-50" />
        ))}
      </div>
    </div>
  )
}

export default function ChatMessages({
  messages,
  streamingContent,
  isStreaming,
  isInitialLoading,
  isLoadingHistory,
  isLoadingMore,
  userName,
  endRef,
}) {
  return (
    <div className="max-w-3xl mx-auto w-full space-y-8 pt-6 md:pt-0 pb-4">
      {isLoadingMore && (
        <div className="flex justify-center py-3">
          {[0, 150, 300].map((d) => (
            <div
              key={d}
              className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce mx-0.5"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[78vh] text-center w-full">
          {isInitialLoading || isLoadingHistory ? (
            <InitialSkeleton />
          ) : (
            <EmptyState userName={userName} />
          )}
        </div>
      ) : isLoadingHistory ? (
        <SkeletonMessages />
      ) : (
        <>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isStreaming && <StreamingBubble content={streamingContent} />}
        </>
      )}

      <div ref={endRef} />
    </div>
  )
}
