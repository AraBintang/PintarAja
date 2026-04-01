import { Check, Copy, FileText, Paperclip } from 'lucide-react'
import { useState } from 'react'

import { AI_CODE_MAP } from '@/assets/ai'

import EmptyState from './EmptyState'

/* ─── Copy button ─── */
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
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-white/10 transition-colors"
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

/* ─── Code block ─── */
function CodeBlock({ lang, code }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-[13px]">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-200 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <span className="text-[11px] font-mono font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <CopyButton code={code} />
      </div>
      <pre className="bg-[#f7f7f5] dark:bg-[#0f141e] px-4 py-3 overflow-x-auto leading-relaxed">
        <code className="font-mono text-[13px] whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}

function InlineCode({ children }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-[13px]">
      {children}
    </code>
  )
}

/* ─── Markdown table ─── */
function MarkdownTable({ rows }) {
  if (rows.length < 2) return null

  const headerCells = rows[0]
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)

  const dataRows = rows.slice(2).map((row) =>
    row
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean),
  )

  return (
    <div className="mt-3 mb-2 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-900">
            {headerCells.map((cell, i) => (
              <th
                key={i}
                className="px-4 py-2.5 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap"
              >
                {renderInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((cells, ri) => (
            <tr
              key={ri}
              className="border-b border-gray-100 dark:border-gray-700/60 last:border-0 hover:bg-gray-50/60 dark:hover:bg-gray-700/20 transition-colors bg-[#f7f7f5] dark:bg-[#0f141e]"
            >
              {cells.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-gray-700 dark:text-gray-300">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function HorizontalRule() {
  return <hr className="my-3 border-0 border-t border-gray-200 dark:border-gray-700" />
}

/* ─── Citation / Annotation block ─── */
function CitationBlock({ annotations }) {
  if (!annotations?.length) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <FileText className="w-3 h-3" />
        Sumber Referensi
      </p>
      <div className="flex flex-col gap-1.5">
        {annotations.map((ann, i) => (
          <div
            key={ann.file_id ?? i}
            className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-blue-700 dark:text-blue-300 truncate">
                {ann.filename ?? ann.file_id ?? 'Dokumen'}
              </p>
              {ann.index != null && (
                <p className="text-[11px] text-blue-500/70 dark:text-blue-400/60 mt-0.5">
                  karakter ke-{ann.index.toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Message content renderer ─── */
function MessageContent({ content }) {
  const raw = String(content)
  const parts = []
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: raw.slice(lastIndex, match.index) })
    }
    parts.push({ type: 'code', lang: match[1] || '', code: match[2] })
    lastIndex = match.index + match[0].length
  }

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

function isTableRow(line) {
  return line.trim().startsWith('|') && line.trim().endsWith('|')
}

function isSeparatorRow(line) {
  return /^\|[\s\-:|]+\|/.test(line.trim())
}

function InlineTextContent({ content }) {
  const lines = content.split('\n')
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (isTableRow(line)) {
      const tableRows = []
      while (i < lines.length && (isTableRow(lines[i]) || isSeparatorRow(lines[i]))) {
        tableRows.push(lines[i])
        i++
      }
      result.push(<MarkdownTable key={`table-${i}`} rows={tableRows} />)
      continue
    }

    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      result.push(<HorizontalRule key={i} />)
      i++
      continue
    }

    if (line.startsWith('### ')) {
      result.push(
        <strong
          key={i}
          className="block text-[15px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1"
        >
          {renderInline(line.slice(4))}
        </strong>,
      )
      i++
      continue
    }

    if (line.startsWith('## ')) {
      result.push(
        <strong
          key={i}
          className="block text-[16px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1"
        >
          {renderInline(line.slice(3))}
        </strong>,
      )
      i++
      continue
    }

    if (line.startsWith('# ')) {
      result.push(
        <strong
          key={i}
          className="block text-[17px] font-bold text-gray-800 dark:text-gray-100 mt-3 mb-1"
        >
          {renderInline(line.slice(2))}
        </strong>,
      )
      i++
      continue
    }

    if (/^[-*] /.test(line)) {
      result.push(
        <span key={i} className="flex gap-2 my-0.5">
          <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </span>,
      )
      i++
      continue
    }

    const numMatch = line.match(/^(\d+)\. (.*)/)
    if (numMatch) {
      result.push(
        <span key={i} className="flex gap-2 my-0.5">
          <span className="text-gray-400 flex-shrink-0 min-w-[1.5rem] text-right">
            {numMatch[1]}.
          </span>
          <span>{renderInline(numMatch[2])}</span>
        </span>,
      )
      i++
      continue
    }

    result.push(
      <span key={i}>
        {renderInline(line)}
        {i < lines.length - 1 && '\n'}
      </span>,
    )
    i++
  }

  return <span className="whitespace-pre-wrap break-words">{result}</span>
}

function renderInline(text) {
  const parts = []
  const regex = /`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)/g
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
    } else if (m[4] !== undefined && m[5] !== undefined) {
      parts.push(
        <a
          key={m.index}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline underline-offset-2 decoration-blue-300/60 hover:decoration-blue-500 transition-colors"
        >
          {m[4]}
        </a>,
      )
    }

    last = m.index + m[0].length
  }

  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

/* ─── Parse fileMeta dari pesan (support kedua sumber: live & dari DB) ─── */
function parseFileMeta(msg) {
  // Pesan baru dari state langsung punya fileMeta
  if (Array.isArray(msg.fileMeta) && msg.fileMeta.length > 0) {
    return msg.fileMeta
  }

  // Pesan dari DB: content adalah JSON array
  // Format: [{"type":"text","text":"..."}, {"type":"image","name":"...","base64":"..."}, {"type":"file","name":"..."}]
  try {
    const parsed = JSON.parse(msg.content)
    if (Array.isArray(parsed)) {
      return parsed
        .filter((p) => p.type === 'image' || p.type === 'file')
        .map((p) => ({
          name: p.name ?? p.filename ?? 'file',
          type: p.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
          isImage: p.type === 'image',
          base64: p.base64 ?? null,
        }))
    }
    // eslint-disable-next-line no-unused-vars, no-empty
  } catch (_) {}

  // Fallback: format lama dengan msg.files
  if (Array.isArray(msg.files) && msg.files.length > 0) {
    return msg.files.map((f) => ({
      name: f.name ?? 'file',
      type: f.type ?? '',
      isImage: false,
      base64: null,
    }))
  }

  return []
}

/* ─── Parse text content dari pesan ─── */
function parseTextContent(msg) {
  // Pesan baru dari state: content adalah string teks murni
  if (Array.isArray(msg.fileMeta)) {
    return msg.content
  }

  // Coba parse JSON (pesan dari DB dengan lampiran)
  try {
    const parsed = JSON.parse(msg.content)
    if (Array.isArray(parsed)) {
      const textPart = parsed.find((p) => p.type === 'text')
      return textPart?.text ?? ''
    }
    // eslint-disable-next-line no-unused-vars, no-empty
  } catch (_) {}

  return msg.content
}

/* ─── Attachment preview di ATAS bubble (image tampil full, file sebagai chip) ─── */
function AttachmentPreview({ fileMeta }) {
  if (!fileMeta || fileMeta.length === 0) return null

  const images = fileMeta.filter((f) => f.isImage)
  const files = fileMeta.filter((f) => !f.isImage)

  return (
    <div className="flex flex-col items-end gap-2 mb-1.5 max-w-[85%] md:max-w-[75%]">
      {/* Images: tampil sebagai thumbnail */}
      {images.length > 0 && (
        <div className={`flex gap-2 flex-wrap justify-end`}>
          {images.map((img, i) =>
            img.base64 ? (
              <div
                key={i}
                className="relative group rounded-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/50"
                style={{
                  width: images.length === 1 ? '160px' : '120px',
                  maxHeight: images.length === 1 ? '160px' : '120px',
                }}
              >
                <img
                  src={img.base64}
                  alt={img.name}
                  className="w-full h-auto object-contain rounded-2xl block"
                  style={{
                    maxHeight: images.length === 1 ? '320px' : '120px',
                  }}
                  loading="lazy"
                />
              </div>
            ) : (
              // Fallback jika base64 tidak ada (pesan lama tanpa base64)
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </div>
                <span className="text-[12px] font-medium text-blue-700 dark:text-blue-300 truncate max-w-[120px]">
                  {img.name}
                </span>
              </div>
            ),
          )}
        </div>
      )}

      {/* Files: tampil sebagai chip */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-end">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600/50 rounded-xl"
            >
              <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Paperclip className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </div>
              <span className="text-[12px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                {f.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'

  // Parse text content (handle JSON array dari DB maupun string biasa)
  const textContent = isUser ? parseTextContent(msg) : msg.content

  // Parse file metadata (support fileMeta live, JSON DB, maupun msg.files lama)
  const fileMeta = isUser ? parseFileMeta(msg) : []

  let annotations = []
  try {
    const raw = msg.annotations
    if (Array.isArray(raw)) annotations = raw
    else if (typeof raw === 'string' && raw) annotations = JSON.parse(raw)
    // eslint-disable-next-line no-unused-vars, no-empty
  } catch (_) {}

  return (
    <div className={`flex flex-col w-full mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* ─── Attachment preview DI ATAS bubble (hanya untuk user) ─── */}
      {isUser && fileMeta.length > 0 && <AttachmentPreview fileMeta={fileMeta} />}

      {/* ─── Bubble chat ─── */}
      {/* Sembunyikan bubble jika tidak ada teks dan ada file (agar tidak muncul bubble kosong) */}
      {(textContent || !isUser) && (
        <div
          className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-[#eeedeb] dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none max-w-[85%] md:max-w-[75%]'
              : 'max-w-[95%] bg-[#eeedeb] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none'
          }`}
        >
          <MessageContent content={textContent} />

          {/* Citations / Annotations dari file search */}
          {!isUser && annotations.length > 0 && <CitationBlock annotations={annotations} />}

          {/* Footer: AI model info + waktu */}
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
      )}
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

/* ─── Skeleton saat loading history ─── */
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

/* ─── Skeleton awal ─── */
function InitialSkeleton() {
  return (
    <div className="w-full space-y-6">
      <div className="h-8 w-160 skeleton rounded-xl mx-auto" />
      <div className="grid grid-cols-2 gap-4 max-w-xl px-6 mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 skeleton rounded-xl opacity-50" />
        ))}
        <div className="h-14 col-span-2 skeleton rounded-xl opacity-50" />
      </div>
    </div>
  )
}

/* ─── Main export ─── */
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
    <div className="max-w-3xl mx-auto w-full space-y-8 md:px-4 pt-14 md:pt-0">
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
