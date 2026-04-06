import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({
  currentPage,
  totalPages,
  total = 0,
  pageSize = 10,
  onPageChange,
  label = 'item',
  className = '',
}) {
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

    const pages = []
    const left = Math.max(2, currentPage - 1)
    const right = Math.min(totalPages - 1, currentPage + 1)

    pages.push(1)
    if (left > 2) pages.push('...')
    for (let i = left; i <= right; i++) pages.push(i)
    if (right < totalPages - 1) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  if (totalPages <= 1 && total <= pageSize) return null

  return (
    <div className={`flex items-center justify-between flex-wrap gap-3 ${className}`}>
      <p className="text-[13px] text-gray-500 dark:text-gray-400">
        Viewing{' '}
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {from}–{to}
        </span>{' '}
        from <span className="font-semibold text-gray-800 dark:text-gray-100">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="text-gray-400 text-sm px-1">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-[13px] transition-colors ${
                currentPage === p
                  ? 'bg-blue-600 dark:bg-orange-500 text-white shadow-sm shadow-blue-200 dark:shadow-orange-900/30'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
