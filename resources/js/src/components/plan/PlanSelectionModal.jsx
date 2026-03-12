import { Crown, Sparkles, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSettingsModal } from '@/context/SettingsModalContext'
import { request } from '@/utils/Http'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

export default function PlanSelectionModal({ open, onClose, onSelectPlan }) {
  const navigate = useNavigate()
  const { closeSettings } = useSettingsModal()

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

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

  const handleBuy = (plan) => {
    if (onSelectPlan) {
      onSelectPlan(plan)
      onClose()
      return
    }
    onClose()
    closeSettings()
    navigate('/payment', { state: { plan, returnUrl: window.location.pathname } })
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-[#1a1f2e] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header */}
        <div className="relative px-8 pt-8 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Pilih Paket Langganan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tingkatkan akun Anda dengan fitur premium
          </p>
        </div>

        {/* Plan Cards */}
        <div className="px-8 pb-8 pt-2 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
                />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Tidak ada paket tersedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isPopular = plan.isPopular === 'Y'
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-2xl p-6 flex flex-col border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${
                      isPopular
                        ? 'border-blue-500 dark:border-orange-500 bg-white dark:bg-orange-900/10 shadow-lg shadow-blue-100/50 dark:shadow-orange-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 shadow-sm'
                    }`}
                  >
                    {/* Popular Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 dark:from-orange-400 dark:to-orange-500 text-white shadow-lg">
                          <Crown className="w-3 h-3" />
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Name */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mt-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 min-h-[32px] line-clamp-2">
                      {plan.tagLine}
                    </p>

                    {/* Price */}
                    <div className="text-center my-5">
                      {plan.price?.monthly > 0 && (
                        <span className="text-sm text-gray-400 line-through block mb-1">
                          Rp {formatPrice(plan.price.monthly)}
                        </span>
                      )}
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-3xl font-extrabold text-[#118A43]">
                          Rp{' '}
                          {plan.price?.discounted === 0
                            ? '0'
                            : formatPrice(plan.price?.discounted ?? 0)}
                        </span>
                        <span className="text-sm font-semibold text-[#118A43] mb-1">/bln</span>
                      </div>
                    </div>

                    {/* Features preview */}
                    <div className="flex-1 mb-5">
                      <ul className="space-y-2">
                        {(plan.features ?? []).slice(0, 4).map((f, idx) => (
                          <li
                            key={idx}
                            className={`flex items-center gap-2 text-xs ${
                              f.isIncluded === false
                                ? 'text-gray-300 dark:text-gray-600'
                                : 'text-gray-600 dark:text-gray-300'
                            }`}
                          >
                            <Sparkles className="w-3 h-3 text-blue-500 dark:text-orange-400 flex-shrink-0" />
                            <span className="truncate">{f.title}</span>
                          </li>
                        ))}
                        {(plan.features ?? []).length > 4 && (
                          <li className="text-xs text-gray-400 pl-5">
                            +{plan.features.length - 4} fitur lainnya
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuy(plan)}
                      className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                        isPopular
                          ? 'bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-700 dark:hover:bg-orange-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                      }`}
                    >
                      Buy
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
