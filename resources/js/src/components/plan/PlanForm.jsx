import { Check, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  name: '',
  tagLine: '',
  price: { monthly: 0, discounted: 0 },
  features: [],
  isPopular: 'N',
  aiSettings: [],
}

const AI_OPTIONS = [
  'Google Gemini 3.1 Pro',
  'Google Gemini Flash',
  'OpenAI GPT-4o',
  'OpenAI GPT-4o mini',
  'Claude 3.5 Sonnet',
  'Claude 3 Haiku',
  'Meta Llama 3.1',
]

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
        setForm({
          name: initialData.name ?? '',
          tagLine: initialData.tagLine ?? '',
          price: initialData.price ?? { monthly: 0, discounted: 0 },
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

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) return
    setField('features', [
      ...form.features,
      {
        title: newFeatureTitle.trim(),
        desc: newFeatureAI ? `Didukung oleh ${newFeatureAI}` : 'Kustom Fitur',
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

  const handleSubmit = () => {
    onSubmit({
      name: form.name,
      tagLine: form.tagLine,
      price: form.price,
      features: form.features,
      isPopular: form.isPopular,
      aiSettings: form.aiSettings,
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'
  const smLabelClass = 'text-[12px] font-semibold text-gray-500 dark:text-gray-400 block'

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg tracking-wide">
            {isEdit ? 'Edit Plan' : 'Add New Plan'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Basics */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Plan Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="e.g. Pro Account"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Tag Line / Description</label>
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
            <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400" />
              Pricing
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={smLabelClass}>Regular Monthly (Rp)</label>
                <input
                  type="number"
                  value={form.price.monthly}
                  onChange={(e) =>
                    setField('price', { ...form.price, monthly: Number(e.target.value) })
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label className={smLabelClass}>Discounted Monthly (Rp)</label>
                <input
                  type="number"
                  value={form.price.discounted}
                  onChange={(e) =>
                    setField('price', { ...form.price, discounted: Number(e.target.value) })
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Included Features
            </h4>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4 max-h-[240px] overflow-y-auto">
              {form.features.length === 0 && (
                <p className="text-[12px] text-gray-400 italic text-center py-4">Belum ada fitur</p>
              )}
              {form.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-200 dark:hover:border-orange-400/40 transition-all group"
                >
                  <label className="flex items-start gap-3 cursor-pointer flex-1">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 group-hover:border-blue-400 dark:group-hover:border-orange-400 transition-colors flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={feature.isIncluded !== false}
                        onChange={(e) => handleToggleFeature(idx, e.target.checked)}
                        className="peer opacity-0 absolute inset-0 cursor-pointer"
                      />
                      <Check className="w-3.5 h-3.5 text-blue-600 dark:text-orange-400 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 block mb-0.5">
                        {feature.title}
                      </span>
                      <span className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed block">
                        {feature.desc}
                      </span>
                    </div>
                  </label>
                  <button
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0 mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add custom feature */}
            <div className="bg-blue-50/50 dark:bg-orange-900/10 rounded-xl p-4 border border-blue-100 dark:border-orange-900/30 space-y-3">
              <h5 className="text-[13px] font-bold text-blue-900 dark:text-orange-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Tambah Fitur Kustom
              </h5>
              <input
                type="text"
                value={newFeatureTitle}
                onChange={(e) => setNewFeatureTitle(e.target.value)}
                placeholder="Nama Fitur (cth: Akses API 24/7)"
                className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-10 text-[13px] text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors"
              />
              <div className="relative">
                <select
                  value={newFeatureAI}
                  onChange={(e) => setNewFeatureAI(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-10 text-[13px] text-gray-800 dark:text-gray-100 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Pilih Model AI (Opsional)</option>
                  {AI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleAddFeature}
                className="w-full py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg text-[13px] font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambahkan Fitur
              </button>
            </div>
          </div>

          {/* AI Settings */}
          {aiList.length > 0 && (
            <div>
              <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400" />
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
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-orange-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${active ? 'bg-white border-white' : 'border-gray-300 dark:border-gray-600'}`}
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

          {/* Popular */}
          <div
            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30 cursor-pointer group"
            onClick={() => setField('isPopular', form.isPopular === 'Y' ? 'N' : 'Y')}
          >
            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-amber-300 bg-white dark:bg-gray-800 group-hover:border-amber-400 transition-colors flex-shrink-0">
              <input
                type="checkbox"
                checked={form.isPopular === 'Y'}
                onChange={() => {}}
                className="peer opacity-0 absolute inset-0 cursor-pointer"
              />
              <Check className="w-3.5 h-3.5 text-amber-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-[13px] font-bold text-amber-800 dark:text-amber-400">
              Mark as Popular Plan
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all uppercase tracking-wide"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
