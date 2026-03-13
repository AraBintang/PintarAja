import { Paperclip } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AI_CODE_MAP, CHAT_FEATURES } from './ChatConstants'

/* ─── Render markdown sederhana ─── */
function MessageContent({ content }) {
  const html = String(content)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>')
  return (
    <span className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: html }} />
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
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
        {msg.files?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {msg.files.map((f, i) => (
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

        <MessageContent content={msg.content} />

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
      {/* Load-more indicator (scroll ke atas) */}
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
