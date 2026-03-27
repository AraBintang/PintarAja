import { Check, Crown, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useScrollReveal from '@/hooks/useScrollReveal'
import { request } from '@/utils/Http'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function parseFeatures(features) {
  if (!features) return []
  if (Array.isArray(features)) {
    return features.map((f) => {
      // Handle the case where the backend returns an array of objects {title, desc, isIncluded}
      if (f && typeof f === 'object' && 'title' in f) {
        return { title: f.title, isIncluded: f.isIncluded !== false }
      }
      return typeof f === 'string'
        ? { title: f, isIncluded: true }
        : { title: String(f), isIncluded: true }
    })
  }
  if (typeof features === 'string') {
    return features
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title) => ({ title, isIncluded: true }))
  }
  return []
}

const PERIOD_OPTIONS = [
  { key: 'weekly', label: 'Mingguan', suffix: 'Weekly', unit: '/minggu' },
  { key: 'monthly', label: 'Bulanan', suffix: 'Monthly', unit: '/bulan' },
  { key: 'yearly', label: 'Tahunan', suffix: 'Yearly', unit: '/tahun' },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { ref: sectionRef, isVisible } = useScrollReveal({ threshold: 0.1 })
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('monthly')

  useEffect(() => {
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
  }, [])

  const activePeriod = PERIOD_OPTIONS.find((p) => p.key === period)

  const getPriceInfo = (plan) => {
    const p = plan.price ?? {}
    const base = p[period] ?? 0
    const disc = p[`${period}_discount`] ?? 0
    const final = p[`${period}_final`] ?? base
    const isYearly = period === 'yearly'
    const perMonth = isYearly && final > 0 ? Math.round(final / 12) : null
    return { base, disc, final, hasDiscount: disc > 0 && base > 0, isYearly, perMonth }
  }

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
    navigate('/checkout', { state: { plan: enriched, returnUrl: window.location.pathname } })
  }

  return (
    <section id="pricing" ref={sectionRef} className="pt-8 pb-40 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 xl:px-0">
        {/* Header */}
        <div
          className={`text-center max-w-3xl mx-auto mb-10 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transition: 'opacity 0.7s ease, transform 0.7s ease' }}
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-[#118A43] bg-[#118A43]/10 border border-[#118A43]/20 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Paket Premium
          </span>
          <h2 className="text-3xl md:text-[44px] font-extrabold text-[#0a192f] dark:text-white leading-[1.2] mb-6 tracking-tight">
            Pilih Paket AI Anda
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Tingkatkan produktivitas dan kreativitas dengan model AI tercanggih kami.
          </p>
        </div>

        {/* Period Toggle */}
        <div
          className={`flex justify-center mb-12 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s' }}
        >
          <div className="flex w-full sm:w-auto sm:inline-flex items-stretch justify-between sm:justify-center gap-1 sm:gap-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 sm:p-1.5 shadow-inner mx-auto">
            {PERIOD_OPTIONS.map((opt) => {
              const hasDiscount = periodHasDiscount(opt.key)
              return (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`py-2 px-1 sm:px-6 sm:py-2.5 rounded-xl text-[12px] sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 flex-1 sm:flex-none leading-tight ${
                    period === opt.key
                      ? 'bg-blue-600 dark:bg-orange-500 text-white shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {hasDiscount && (
                    <span
                      className={`text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        period === opt.key
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                          : 'text-emerald-500 dark:text-emerald-400'
                      }`}
                    >
                      PROMO
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Pricing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto w-full">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">Belum ada paket tersedia</p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-wrap justify-center items-center md:items-stretch gap-6 lg:gap-8 max-w-[1200px] mx-auto w-full">
            {plans.map((plan, i) => {
              const isPopular = plan.isPopular === 'Y'
              const { base, disc, final, hasDiscount, isYearly, perMonth } = getPriceInfo(plan)

              return (
                <div
                  key={plan.id}
                  className={`relative w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-22px)] max-w-sm bg-white dark:bg-gray-800 rounded-[24px] p-6 sm:p-8 xl:px-8 border flex flex-col ${
                    isPopular
                      ? 'border-blue-500 dark:border-orange-500 border-2 shadow-xl shadow-blue-100/50 dark:shadow-orange-900/10 scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
                  } ${
                    isVisible
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95'
                  } transition-all`}
                  style={{
                    transition: 'opacity 0.6s ease, transform 0.6s ease',
                    transitionDelay: `${0.2 + i * 0.15}s`,
                  }}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-orange-500 dark:to-orange-400 text-white shadow-lg">
                        <Crown className="w-3.5 h-3.5" />
                        POPULER
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6 mt-2">
                    <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-3">
                      {plan.name}
                    </h3>
                    <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed min-h-[40px]">
                      {plan.tagLine}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6">
                    {isYearly && perMonth !== null ? (
                      <>
                        {hasDiscount && (
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-base font-bold text-gray-400 line-through">
                              Rp {formatPrice(Math.round(base / 12))}
                            </span>
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              Hemat {disc}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-end justify-center gap-1">
                          <span className="text-3xl font-extrabold text-[#118A43]">
                            Rp {formatPrice(perMonth)}
                          </span>
                          <span className="text-lg font-semibold text-[#118A43] mb-0.5">
                            /bulan
                          </span>
                        </div>
                        <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                          Tagihan Rp {formatPrice(final)}/tahun
                        </p>
                      </>
                    ) : (
                      <>
                        {hasDiscount && (
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-base font-bold text-gray-400 line-through">
                              Rp {formatPrice(base)}
                            </span>
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              -{disc}%
                            </span>
                          </div>
                        )}
                        <div className="flex items-end justify-center gap-1">
                          <span className="text-3xl font-extrabold text-[#118A43]">
                            Rp {final === 0 ? '0' : formatPrice(final)}
                          </span>
                          <span className="text-lg font-semibold text-[#118A43] mb-0.5">
                            {activePeriod.unit}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mb-8">
                    <button
                      onClick={() => handleBuy(plan)}
                      disabled={plan.id === 1}
                      className={`w-full py-3.5 rounded-full font-bold text-[14px] shadow-md hover:shadow-lg transition-all active:scale-[0.98] ${
                        plan.id === 1
                          ? 'hidden'
                          : isPopular
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 dark:from-orange-500 dark:to-orange-400 text-white hover:from-blue-700 hover:to-blue-600 dark:hover:from-orange-600 dark:hover:to-orange-500'
                            : 'bg-[#295cce] text-white hover:bg-[#1a4baf]'
                      }`}
                    >
                      Pilih Paket
                    </button>
                  </div>

                  {/* Features */}
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                      Fitur yang didapat:
                    </p>
                    <ul className="space-y-3">
                      {parseFeatures(plan.features).map((f, idx) => (
                        <li
                          key={idx}
                          className={`flex items-center gap-3 text-[13px] ${
                            f.isIncluded === false
                              ? 'text-gray-300 dark:text-gray-600'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              f.isIncluded === false
                                ? 'bg-gray-100 dark:bg-gray-700'
                                : 'bg-emerald-100 dark:bg-emerald-900/30'
                            }`}
                          >
                            <Check
                              className={`w-3 h-3 ${
                                f.isIncluded === false
                                  ? 'text-gray-300 dark:text-gray-600'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            />
                          </div>
                          <span className="leading-snug">{f.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
