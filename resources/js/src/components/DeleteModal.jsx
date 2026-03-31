import { AlertTriangle } from 'lucide-react'

export default function DeleteModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  data = '',
  name = '',
  warning = null,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-gray-700">
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <div className="w-full">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hapus {data}</h3>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
              Yakin ingin menghapus{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{name}</span>?
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {/* Warning — hanya muncul kalau ada */}
            {warning && (
              <div className="flex items-start gap-2.5 mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-left">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  {warning}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
