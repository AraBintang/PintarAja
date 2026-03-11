import { ChevronRight, CreditCard, Gift, Package } from 'lucide-react'
export default function SubscriptionTab() {
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10">
      <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Status Langganan</h2>
            <p className="text-gray-500 dark:text-gray-400">Detail paket premium Anda saat ini</p>
          </div>
          <div className="px-5 py-2.5 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none font-bold text-sm flex items-center gap-2">
            <Package className="w-4 h-4" />
            Premium Plan
          </div>
        </div>

        <div className="grid gap-6">
          {/* Progress Card */}
          <div className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                Sisa Masa Aktif
              </span>
              <span className="text-lg font-black text-gray-900 dark:text-white">
                5 <span className="text-sm font-bold text-gray-400">/ 7 Hari</span>
              </span>
            </div>
            <div className="h-4 w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden p-1 border border-white/50 dark:border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.4)] animate-pulse"
                style={{ width: '71%' }}
              ></div>
            </div>

            <div className="flex items-center gap-3 pt-2 text-sm">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-gray-600 dark:text-gray-400 font-medium font-sans">
                Berakhir secara otomatis pada{' '}
                <span className="text-gray-900 dark:text-white font-bold">10 Maret 2026</span>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="flex-1 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl shadow-gray-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all text-[15px] flex items-center justify-center gap-2">
              Upgrade Paket
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Redeem Code */}
          <div className="mt-6 p-6 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">
              Punya Kode Redeem?
            </label>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="ABC-123-XYZ"
                className="flex-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 ring-indigo-500/20 outline-none transition-all"
              />
              <button className="px-5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-100 dark:shadow-none hover:bg-emerald-600 transition-all active:scale-95">
                <Gift className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
