import { ChevronRight, CreditCard, Gift, Info, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import PlanSelectionModal from '@/components/plan/PlanSelectionModal'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function PlanTab() {
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

  const isActive = remainingDays > 0

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
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Plan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Kelola paket dan masa aktif akun Anda
          </p>
        </div>

        {/* Plan Badge + Status Card */}
        <div className="mb-2  relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 dark:from-orange-400 dark:via-orange-500 dark:to-amber-400" />

          <div className="p-6 bg-gray-50 dark:bg-gray-800/40 space-y-5">
            {/* Plan name row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    Active Plan
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {user?.plan_name ?? 'Free'}
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {isActive ? '● Active' : '○ Not Active'}
              </span>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Remaining Active Period
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {remainingDays}
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    {remainingDays > 1 ? 'Days' : 'Day'}
                  </span>
                </span>
              </div>

              <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-orange-400 dark:to-amber-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Expire info */}
            {expiredAt && user?.plan_id !== 1 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Ends on{' '}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {expiredAt.toLocaleDateString('en-UK', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mb-6 flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600">
          <Info className="w-3.5 h-3.5" />
          Try Reloading web if plan not changed
        </div>

        {/* Upgrade Button */}
        <button
          onClick={() => setPlanModalOpen(true)}
          className="
            w-full py-3.5 mb-6 rounded-xl font-bold text-sm flex items-center text-center justify-center gap-2
            bg-gray-900 text-white hover:bg-gray-800
            dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100
            transition-all active:scale-[0.98]
          "
        >
          <Zap className="w-4 h-4" />
          Upgrade Plan
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Redeem */}
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Redeem Code</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Punya kode voucher? Masukkan di sini
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-2">
            <input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
              placeholder="ABC-123-XYZ"
              className="
                flex-1 px-4 py-2.5 rounded-xl
                bg-gray-50 dark:bg-gray-800
                border border-gray-200 dark:border-gray-700
                text-sm font-mono text-gray-800 dark:text-gray-200
                placeholder-gray-400 dark:placeholder-gray-600
                focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-orange-900/30
                focus:border-blue-400 dark:focus:border-orange-400
                transition-all
              "
            />
            <button
              onClick={handleRedeem}
              disabled={loading}
              className="
                px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5
                bg-emerald-500 hover:bg-emerald-600
                text-white text-sm font-bold
                disabled:opacity-50 active:scale-95 transition-all
              "
            >
              <Gift className="w-4 h-4" />
              {loading ? '...' : 'Redeem'}
            </button>
          </div>
        </div>
      </div>

      <PlanSelectionModal
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        fromSettings={true}
      />
    </div>
  )
}
