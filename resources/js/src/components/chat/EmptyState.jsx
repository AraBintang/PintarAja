import { FileSearch, FileText, Hash, Speech, Mic, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

// Icon wrapper dengan warna background per fitur
const iconStyles = {
  blue: { bg: 'bg-[#E6F1FB] dark:bg-[#0C447C]', text: 'text-[#185FA5] dark:text-[#B5D4F4]' },
  green: { bg: 'bg-[#EAF3DE] dark:bg-[#27500A]', text: 'text-[#3B6D11] dark:text-[#C0DD97]' },
  orange: { bg: 'bg-[#FAEEDA] dark:bg-[#633806]', text: 'text-[#854F0B] dark:text-[#FAC775]' },
  purple: { bg: 'bg-[#EEEDFE] dark:bg-[#3C3489]', text: 'text-[#534AB7] dark:text-[#CECBF6]' },
  coral: { bg: 'bg-[#FAECE7] dark:bg-[#712B13]', text: 'text-[#993C1D] dark:text-[#F5C4B3]' },
}

// Icon panah kecil untuk hover
const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const CHAT_FEATURES = [
  {
    label: 'AI Writer',
    tag: 'Generate content',
    to: '/writer',
    color: 'blue',
    icon: <FileText className="w-[18px] h-[18px]" />,
  },
  {
    label: 'Paraphrase AI',
    tag: 'Reword text',
    to: '/paraphrase',
    color: 'green',
    icon: <Hash className="w-[18px] h-[18px]" />,
    isComingSoon: true,
  },
  {
    label: 'Humanizer AI',
    tag: 'Sound natural',
    to: '/humanize',
    color: 'orange',
    icon: <Speech className="w-[18px] h-[18px]" />,
    isComingSoon: true,
  },
  {
    label: 'Transcribe AI',
    tag: 'Speech to text',
    to: '/transcribe',
    color: 'purple',
    icon: <Mic />,
  },
  {
    label: 'Plagiarism Checker',
    tag: 'Verify originality',
    to: '/plagiarism',
    color: 'coral',
    icon: <FileSearch className="w-[18px] h-[18px]" />,
  },
]

function FeatureCard({ item }) {
  const { bg, text } = iconStyles[item.color]

  if (item.isComingSoon) {
    return (
      <div
        className={`
          group flex items-center gap-3
          px-3.5 py-3 md:p-[14px_16px]
          bg-white/50 dark:bg-gray-900/50
          border border-gray-200/60 dark:border-gray-700/60
          rounded-xl opacity-60 cursor-not-allowed
          ${item.fullWidth ? 'md:col-span-2' : ''}
        `}
      >
        <div
          className={`
            w-8 h-8 md:w-[38px] md:h-[38px]
            rounded-[8px] md:rounded-[10px] flex-shrink-0
            flex items-center justify-center
            ${bg} ${text}
          `}
        >
          <span className="w-[15px] h-[15px] md:w-[18px] md:h-[18px] flex items-center justify-center">
            {item.icon}
          </span>
        </div>

        <div className="text-start min-w-0 flex-1">
          <p className="text-[13px] md:text-[13.5px] font-medium text-gray-800 dark:text-gray-100 leading-snug truncate">
            {item.label}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-[1px] truncate">{item.tag}</p>
        </div>

        <div className="ml-auto flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 uppercase tracking-wider">
            Soon
          </span>
        </div>
      </div>
    )
  }

  return (
    <Link
      to={item.to}
      className={`
        group flex items-center gap-3
        px-3.5 py-3 md:p-[14px_16px]
        bg-white dark:bg-gray-900
        border border-gray-200/60 dark:border-gray-700/60
        rounded-xl transition-all duration-150
        hover:border-gray-300 dark:hover:border-gray-600
        hover:bg-gray-50 dark:hover:bg-gray-800/60
        active:scale-[0.98] active:bg-gray-100 dark:active:bg-gray-800
        ${item.fullWidth ? 'md:col-span-2' : ''}
      `}
    >
      <div
        className={`
          w-8 h-8 md:w-[38px] md:h-[38px]
          rounded-[8px] md:rounded-[10px] flex-shrink-0
          flex items-center justify-center
          transition-transform duration-200
          group-hover:scale-110 group-hover:-rotate-[4deg]
          ${bg} ${text}
        `}
        style={{ transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }}
      >
        <span className="w-[15px] h-[15px] md:w-[18px] md:h-[18px] flex items-center justify-center">
          {item.icon}
        </span>
      </div>

      <div className="text-start min-w-0">
        <p className="text-[13px] md:text-[13.5px] font-medium text-gray-800 dark:text-gray-100 leading-snug truncate">
          {item.label}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-[1px] truncate">{item.tag}</p>
      </div>

      <div
        className="
          ml-auto text-gray-400 dark:text-gray-600 flex-shrink-0
          opacity-0 -translate-x-1
          transition-all duration-150
          group-hover:opacity-100 group-hover:translate-x-0
          hidden md:block
        "
      >
        <ArrowIcon />
      </div>

      {/* Mobile: chevron statis, selalu keliatan */}
      <div className="ml-auto text-gray-300 dark:text-gray-600 flex-shrink-0 md:hidden">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  )
}

export default function EmptyState({ userName }) {
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 tracking-tight px-6">
        Hi <span className="gradient-name">{userName}</span>, What can we help you with today
      </h1>

      {/* Mobile: horizontal scroll chips */}
      <div className="md:hidden w-full px-4 mb-2">
        <div className="flex flex-wrap justify-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CHAT_FEATURES.map((item) => {
            const { bg, text } = iconStyles[item.color]
            
            if (item.isComingSoon) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                    bg-gray-100/50 dark:bg-gray-800/50
                    border border-gray-200/60 dark:border-gray-700/60
                    opacity-60 cursor-not-allowed flex-shrink-0"
                >
                  <div
                    className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 ${bg} ${text}`}
                  >
                    <span className="w-[11px] h-[11px] flex items-center justify-center">
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {item.label}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-[1px] ml-0.5 rounded bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 uppercase tracking-wider">
                    Soon
                  </span>
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.to}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                  bg-gray-100 dark:bg-gray-800
                  border border-gray-200/60 dark:border-gray-700/60
                  active:scale-95 transition-transform flex-shrink-0"
              >
                <div
                  className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center flex-shrink-0 ${bg} ${text}`}
                >
                  <span className="w-[11px] h-[11px] flex items-center justify-center">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[12px] font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Desktop: grid cards seperti sebelumnya */}
      <div className="hidden md:grid grid-cols-2 gap-[10px] w-full max-w-[560px] px-6">
        {CHAT_FEATURES.map((item) => (
          <FeatureCard key={item.label} item={item} />
        ))}
      </div>
    </>
  )
}
