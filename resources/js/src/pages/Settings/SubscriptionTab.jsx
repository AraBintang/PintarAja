import { ChevronRight, CreditCard, Gift, Package } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

import PlanSelectionModal from '@/components/plan/PlanSelectionModal'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function SubscriptionTab() {
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()
  const [searchParams, setSearchParams] = useSearchParams()

  const [redeemCode, setRedeemCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [planModalOpen, setPlanModalOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('openPlans') === 'true') {
      setPlanModalOpen(true)
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('openPlans')
      setSearchParams(newParams, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const expiredAt = user?.subscription_expired_at ? new Date(user.subscription_expired_at) : null

  const today = new Date()

  const remainingDays = expiredAt
    ? Math.max(Math.ceil((expiredAt - today) / (1000 * 60 * 60 * 24)), 0)
    : 0

  const totalDays = 30
  const progress = Math.min((remainingDays / totalDays) * 100, 100)

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      showSnackbar('error', 'Masukkan kode redeem')
      return
    }

    if (loading) return

    setLoading(true)

    try {
      await request('/profiles/redeem', {
        method: 'POST',
        body: { code: redeemCode },
      })

      showSnackbar('success', 'Kode berhasil diredeem')
      setRedeemCode('')

      window.location.reload()
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10">
      <div className="max-w-3xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subscription</h2>
            <p className="text-gray-500 dark:text-gray-400">Informasi paket langganan Anda</p>
          </div>

          <div
            className="px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2
            bg-[#2686D4] text-white
            dark:bg-gradient-to-br dark:from-orange-400 dark:to-orange-600
          "
          >
            <Package className="w-4 h-4" />
            {user?.plan_name}
          </div>
        </div>

        {/* SUBSCRIPTION CARD */}
        <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 p-7 space-y-6">
          {/* remaining */}
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Sisa Masa Aktif
            </span>

            <span className="text-lg font-black text-gray-900 dark:text-white">
              {remainingDays}
              <span className="text-sm font-bold text-gray-400"> Hari</span>
            </span>
          </div>

          {/* progress */}
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden p-1">
            <div
              className="
              h-full rounded-full
              bg-[#2686D4]
              dark:bg-gradient-to-r dark:from-orange-400 dark:to-orange-500
              transition-all duration-500
              "
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* expire date */}
          {expiredAt && (
            <div className="flex items-center gap-3 pt-2 text-sm">
              <div
                className="
                p-2 rounded-lg
                bg-blue-100 text-[#2686D4]
                dark:bg-orange-900/40 dark:text-orange-400
              "
              >
                <CreditCard className="w-4 h-4" />
              </div>

              <span className="text-gray-600 dark:text-gray-400 font-medium">
                Berakhir pada{' '}
                <span className="text-gray-900 dark:text-white font-bold">
                  {expiredAt.toLocaleDateString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={() => setPlanModalOpen(true)}
          className="
          w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2
          bg-[#2686D4] text-white
          hover:scale-[1.02] active:scale-95 transition
          dark:bg-white dark:text-gray-900
        "
        >
          Upgrade Paket
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* REDEEM */}
        <div className="p-6 border border-gray-100 dark:border-gray-800 rounded-3xl">
          <label className="block text-sm font-bold text-gray-900 dark:text-white mb-4">
            Redeem Code
          </label>

          <div className="flex gap-2">
            <input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="ABC-123-XYZ"
              className="
                flex-1 px-4 py-3 rounded-xl
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                text-sm font-mono
                focus:ring-2 ring-[#2686D4]/20 dark:ring-orange-500/20
                outline-none
              "
            />

            <button
              onClick={handleRedeem}
              disabled={loading}
              className="
                px-5 rounded-xl flex items-center justify-center text-white bg-emerald-500
                hover:opacity-90
                active:scale-95 transition
              "
            >
              <Gift className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <PlanSelectionModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
      />
    </div>
  )
}
