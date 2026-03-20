import { useState } from 'react'

const WHATSAPP_NUMBER = '6281234567890'
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Halo Admin, saya ingin bertanya dan membutuhkan bantuan terkait layanan di Pintaraja. Mohon bantuannya min',
)

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 right-6" style={{ zIndex: 'var(--wa-zindex, 50)' }}>
      {/* Tooltip label */}
      <div
        className={`
          absolute right-full mr-3 top-1/2 -translate-y-1/2
          bg-gray-900 dark:bg-gray-100
          text-white dark:text-gray-900
          text-xs font-semibold
          px-3 py-1.5 rounded-lg
          whitespace-nowrap
          pointer-events-none
          transition-all duration-200
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}
      >
        Contact Admin
        {/* Arrow */}
        <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-gray-100" />
      </div>

      {/* Ping ring animation */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping" />

      {/* Main button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Hubungi Admin via WhatsApp"
        className={`
          relative w-14 h-14 rounded-full
          bg-[#25D366] hover:bg-[#20b859]
          shadow-lg hover:shadow-xl hover:shadow-[#25D366]/30
          flex items-center justify-center
          transition-all duration-200
          active:scale-95
          ${hovered ? 'scale-110' : 'scale-100'}
        `}
      >
        {/* WhatsApp SVG icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-7 h-7"
          fill="white"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.678 4.82 1.856 6.82L2 30l7.38-1.82A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2Zm0 25.6a11.54 11.54 0 0 1-5.88-1.6l-.42-.25-4.38 1.08 1.1-4.26-.27-.44A11.56 11.56 0 0 1 4.4 16C4.4 9.59 9.59 4.4 16 4.4S27.6 9.59 27.6 16 22.41 27.6 16 27.6Zm6.34-8.66c-.35-.17-2.06-1.02-2.38-1.13-.32-.12-.55-.17-.78.17-.23.35-.9 1.13-1.1 1.36-.2.23-.4.26-.75.09-.35-.17-1.48-.55-2.82-1.74-1.04-.93-1.74-2.08-1.95-2.43-.2-.35-.02-.54.15-.71.16-.16.35-.4.52-.6.17-.2.23-.35.35-.58.12-.23.06-.43-.03-.6-.09-.17-.78-1.88-1.07-2.58-.28-.68-.57-.59-.78-.6h-.67c-.23 0-.6.09-.92.43-.32.35-1.2 1.17-1.2 2.86s1.23 3.32 1.4 3.55c.17.23 2.42 3.7 5.87 5.19.82.35 1.46.56 1.96.72.82.26 1.57.22 2.16.13.66-.1 2.06-.84 2.35-1.66.29-.82.29-1.52.2-1.66-.08-.15-.3-.23-.65-.4Z" />
        </svg>
      </button>
    </div>
  )
}
