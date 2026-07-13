import { useState } from 'react'
import { Coins, CreditCard, ChevronRight, X, Loader2 } from 'lucide-react'
import { request } from '@/utils/Http'
import { useSnackbar } from '@/context/SnackbarContext'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

const QRIS_METHOD = { id: 'qris', name: 'QRIS', channel: 'QRIS2' }

export default function TopupQuotaModal({ open, onClose }) {
  const [coins, setCoins] = useState(100)
  const [loading, setLoading] = useState(false)
  const { showSnackbar } = useSnackbar()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!open) return null

  const handleTopup = async () => {
    if (coins < 100) {
      showSnackbar('error', 'Minimal topup adalah 100 Koin')
      return
    }

    setLoading(true)
    try {
      const res = await request('/payments/topup', {
        method: 'POST',
        body: {
          coins: Number(coins),
          channel: QRIS_METHOD.channel,
          method: QRIS_METHOD.id,
          phone: user?.phone || '0800000000',
        },
      })

      onClose()
      navigate('/payment', {
        state: {
          referenceId: res.referenceId,
          paymentCode: res.paymentCode,
          payUrl: res.payUrl,
          checkoutUrl: res.checkoutUrl,
          expiredAt: res.expiredAt,
          instructions: res.instructions ?? [],
          plan: { name: `Topup ${coins} Koin` },
          price: res.amount,
          selectedMethod: QRIS_METHOD.id,
          transactionType: 'topup',
          returnUrl: '/chat',
        },
      })
    } catch (err) {
      showSnackbar('error', err?.message || 'Gagal memproses topup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-orange-500" />
            Topup Koin AI
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-5">
          <div>
            <label className="text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">
              Jumlah Koin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="100"
                step="100"
                value={coins}
                onChange={(e) => setCoins(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                placeholder="Minimal 100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Minimal pembelian 100 Koin.</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-500/10 rounded-xl p-4 border border-orange-100 dark:border-orange-500/20 flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">Total Pembayaran</p>
              <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mt-0.5">
                Rp {new Intl.NumberFormat('id-ID').format(coins * 100)}
              </p>
            </div>
            <div className="h-10 w-10 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleTopup}
            disabled={loading || coins < 100}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Bayar via QRIS <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
