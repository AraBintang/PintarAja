import { Check, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  name: '',
  tagLine: '',
  price: {
    weekly: 0,
    weekly_discount: 0,
    monthly: 0,
    monthly_discount: 0,
    yearly: 0,
    yearly_discount: 0,
  },
  features: [],
  isPopular: 'N',
  aiSettings: [],
}

const PRICE_TIERS = [
  { period: 'weekly', label: 'Weekly', discKey: 'weekly_discount' },
  { period: 'monthly', label: 'Monthly', discKey: 'monthly_discount' },
  { period: 'yearly', label: 'Annual', discKey: 'yearly_discount' },
]

function computeFinal(base, discountPct) {
  if (!discountPct || discountPct <= 0) return base
  return Math.round(base * (1 - discountPct / 100))
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

export default function PlanForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  aiList = [],
  loading = false,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [newFeatureTitle, setNewFeatureTitle] = useState('')
  const [newFeatureAI, setNewFeatureAI] = useState('')

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      if (initialData) {
        const p = initialData.price ?? {}
        setForm({
          name: initialData.name ?? '',
          tagLine: initialData.tagLine ?? '',
          price: {
            weekly: p.weekly ?? 0,
            weekly_discount: p.weekly_discount ?? 0,
            monthly: p.monthly ?? 0,
            monthly_discount: p.monthly_discount ?? 0,
            yearly: p.yearly ?? 0,
            yearly_discount: p.yearly_discount ?? 0,
          },
          features: initialData.features ?? [],
          isPopular: initialData.isPopular ?? 'N',
          aiSettings: initialData.aiSettings?.map((a) => a.id) ?? [],
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setNewFeatureTitle('')
      setNewFeatureAI('')
    }
  }, [open, initialData])

  if (!open) return null

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const setPriceField = (key, value) => setField('price', { ...form.price, [key]: Number(value) })

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) return
    setField('features', [
      ...form.features,
      {
        title: newFeatureTitle.trim(),
        desc: newFeatureAI ? `Didukung oleh ${newFeatureAI}` : 'Fitur kustom',
        isIncluded: true,
      },
    ])
    setNewFeatureTitle('')
    setNewFeatureAI('')
  }

  const handleToggleFeature = (idx, checked) => {
    const next = [...form.features]
    next[idx] = { ...next[idx], isIncluded: checked }
    setField('features', next)
  }

  const handleRemoveFeature = (idx) =>
    setField(
      'features',
      form.features.filter((_, i) => i !== idx),
    )

  const handleToggleAI = (id) =>
    setField(
      'aiSettings',
      form.aiSettings.includes(id)
        ? form.aiSettings.filter((a) => a !== id)
        : [...form.aiSettings, id],
    )

  const handleSubmit = () =>
    onSubmit({
      name: form.name,
      tagLine: form.tagLine,
      price: form.price,
      features: form.features,
      isPopular: form.isPopular,
      aiSettings: form.aiSettings,
    })

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 hover:border-gray-300 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block mb-1.5'

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">{isEdit ? 'Edit Plan' : 'Add New Plan'}</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Plan Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Pro Account"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tag Line</label>
              <input
                type="text"
                value={form.tagLine}
                onChange={(e) => setField('tagLine', e.target.value)}
                placeholder="e.g. Best for growing teams"
                className={inputClass}
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400 inline-block" />
              Pricing
            </h4>

            <div className="space-y-3">
              {PRICE_TIERS.map(({ period, label, discKey }) => {
                const base = form.price[period]
                const disc = form.price[discKey]
                const final = computeFinal(base, disc)
                const hasDiscount = disc > 0

                return (
                  <div
                    key={period}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {label}
                      </span>
                      {hasDiscount && base > 0 && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Rp {formatPrice(final)}
                          <span className="text-gray-400 font-normal ml-1 line-through">
                            Rp {formatPrice(base)}
                          </span>
                        </span>
                      )}
                      {!hasDiscount && base > 0 && (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          Rp {formatPrice(base)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100 dark:divide-gray-700">
                      <div className="p-3">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                          Normal Price (Rp)
                        </label>
                        <input
                          type="number"
                          value={base}
                          onChange={(e) => setPriceField(period, e.target.value)}
                          placeholder="0"
                          className={inputClass}
                        />
                      </div>
                      <div className="p-3">
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
                          Discount (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={disc}
                            onChange={(e) => setPriceField(discKey, e.target.value)}
                            placeholder="0"
                            className={inputClass + ' pr-8'}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Included Features
            </h4>

            <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700 mb-3 max-h-[200px] overflow-y-auto">
              {form.features.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-3">No feature yet</p>
              )}
              {form.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <label className="flex items-start gap-2.5 cursor-pointer flex-1">
                    <div className="relative w-4 h-4 mt-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex-shrink-0 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={feature.isIncluded !== false}
                        onChange={(e) => handleToggleFeature(idx, e.target.checked)}
                        className="peer opacity-0 absolute inset-0 cursor-pointer"
                      />
                      <Check className="w-3 h-3 text-blue-600 dark:text-orange-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 block">
                        {feature.title}
                      </span>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {feature.desc}
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-0.5 flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature row */}
            <div className="bg-blue-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-blue-100 dark:border-orange-900/30 space-y-2.5">
              <p className="text-[12px] font-bold text-blue-800 dark:text-orange-400 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </p>
              <input
                type="text"
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                placeholder="Feature name..."
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-9 text-[13px] text-gray-800 dark:text-gray-100 focus:border-blue-400 dark:focus:border-orange-400 focus:outline-none transition-colors"
              />
              <div className="flex gap-2">
                <select
                  value={newFeatureAI}
                  onChange={(e) => setNewFeatureAI(e.target.value)}
                  className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-9 text-[13px] text-gray-800 dark:text-gray-100 focus:border-blue-400 dark:focus:border-orange-400 focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Model AI (optional)</option>
                  {['Google Gemini Pro', 'GPT-4o', 'Claude 3.5 Sonnet', 'Llama 3.1'].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddFeature}
                  className="px-4 h-9 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg text-[13px] font-semibold transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          {aiList.length > 0 && (
            <div>
              <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400 inline-block" />
                Linked AI Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                {aiList.map((ai) => {
                  const active = form.aiSettings.includes(ai.id)
                  return (
                    <button
                      key={ai.id}
                      onClick={() => handleToggleAI(ai.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left ${
                        active
                          ? 'bg-blue-600 dark:bg-orange-500 border-blue-600 dark:border-orange-500 text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-300 dark:hover:border-orange-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          active ? 'bg-white border-white' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {active && <Check className="w-3 h-3 text-blue-600 dark:text-orange-500" />}
                      </div>
                      <span className="text-[13px] font-semibold truncate">{ai.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Popular toggle */}
          <div
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 cursor-pointer"
            onClick={() => setField('isPopular', form.isPopular === 'Y' ? 'N' : 'Y')}
          >
            <div className="relative w-5 h-5 rounded border border-amber-300 bg-white dark:bg-gray-800 flex items-center justify-center shrink-0">
              <input
                type="checkbox"
                checked={form.isPopular === 'Y'}
                onChange={() => {}}
                className="peer opacity-0 absolute inset-0 cursor-pointer"
              />
              <Check className="w-3.5 h-3.5 text-amber-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-amber-800 dark:text-amber-400">
                Mark as Popular Plan
              </p>
              <p className="text-[11px] text-amber-600/70 dark:text-amber-500/70 mt-0.5">
                Ditampilkan dengan badge Popular di halaman plan
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl transition-all"
          >
            {loading ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
