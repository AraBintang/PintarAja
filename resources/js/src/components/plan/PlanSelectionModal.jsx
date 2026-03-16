import { Check, Crown, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSettingsModal } from '@/context/SettingsModalContext'
import { request } from '@/utils/Http'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

const PERIOD_OPTIONS = [
  { key: 'weekly', label: 'Weekly', suffix: 'Weekly', unit: '/minggu' },
  { key: 'monthly', label: 'Monthly', suffix: 'Monthly', unit: '/bulan' },
  { key: 'yearly', label: 'Annual', suffix: 'Yearly', unit: '/tahun' },
]

export default function PlanSelectionModal({ open, onClose, onSelectPlan }) {
  const navigate = useNavigate()
  const { closeSettings } = useSettingsModal()

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
    if (!open) return
    const fetchPlans = async () => {
      setLoading(true)
      try {
        const res = await request('/plans?per_page=20')
        setPlans(res.data ?? [])
      } catch {
        setPlans([])
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [open])

  if (!open) return null

  const activePeriod = PERIOD_OPTIONS.find((p) => p.key === period)

  const getPriceInfo = (plan) => {
    const p = plan.price ?? {}
    const base = p[period] ?? 0
    const disc = p[`${period}_discount`] ?? 0
    const final = p[`${period}_final`] ?? base
    return { base, disc, final, hasDiscount: disc > 0 && base > 0 }
  }

  // Cek apakah periode ini ada diskon di setidaknya satu plan
  const periodHasDiscount = (pKey) =>
    plans.some((plan) => {
      const disc = plan.price?.[`${pKey}_discount`] ?? 0
      return disc > 0
    })

  const handleBuy = (plan) => {
    const { final } = getPriceInfo(plan)
    const enriched = {
      ...plan,
      selectedPeriod: period,
      selectedPeriodSuffix: activePeriod.suffix,
      selectedPrice: final,
      itemName: `${plan.name} - ${activePeriod.suffix}`,
    }
    if (onSelectPlan) {
      onSelectPlan(enriched)
      onClose()
      return
    }
    onClose()
    closeSettings()
    navigate('/checkout', { state: { plan: enriched, returnUrl: window.location.pathname } })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-4xl bg-white dark:bg-gray-900 sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Plan</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tingkatkan akses dengan fitur premium
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Period Toggle */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <div className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {PERIOD_OPTIONS.map((opt) => {
              const hasDiscount = periodHasDiscount(opt.key)
              return (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    period === opt.key
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {opt.label}
                  {hasDiscount && (
                    <span
                      className={`text-[9px] font-extrabold px-1 py-0.5 rounded ${
                        period === opt.key
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                      }`}
                    >
                      Promo
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="px-6 pb-6 pt-2 overflow-y-auto flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No plan available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isPopular = plan.isPopular === 'Y'
                const { base, disc, final, hasDiscount } = getPriceInfo(plan)

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl p-5 flex flex-col border transition-colors ${
                      isPopular
                        ? 'border-blue-500 dark:border-orange-500 bg-blue-50/40 dark:bg-orange-900/10 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-600 dark:bg-orange-500 text-white shadow">
                          <Crown className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      </div>
                    )}

                    <div className="mt-2 mb-3">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {plan.tagLine}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {hasDiscount && (
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs text-gray-400 line-through">
                            Rp {formatPrice(base)}
                          </span>
                          <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                            -{disc}%
                          </span>
                        </div>
                      )}
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                          Rp {final === 0 ? '0' : formatPrice(final)}
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-0.5">
                          {activePeriod.unit}
                        </span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="flex-1 space-y-1.5 mb-4">
                      {(plan.features ?? []).slice(0, 4).map((f, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center gap-2 text-xs ${
                            f.isIncluded === false
                              ? 'text-gray-300 dark:text-gray-600'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 shrink-0 ${
                              f.isIncluded === false
                                ? 'text-gray-300 dark:text-gray-600'
                                : 'text-emerald-500'
                            }`}
                          />
                          <span className="truncate">{f.title}</span>
                        </li>
                      ))}
                      {(plan.features ?? []).length > 4 && (
                        <li className="text-xs text-gray-400 pl-5">
                          +{plan.features.length - 4} lainnya
                        </li>
                      )}
                    </ul>

                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={plan.id === 1}
                      className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-700 dark:hover:bg-orange-600'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }
                      ${plan.id === 1 ? 'hidden' : ''}`}
                    >
                      Select Plan
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
