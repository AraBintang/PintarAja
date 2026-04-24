import { Check, ExternalLink, Shield, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { AI_DOC_CONFIG, AI_MODELS } from '@/assets/ai'
import claudeAiIcon from '@/assets/icons/claude-ai-icon.svg'
import deepseekAiIcon from '@/assets/icons/deepseek-ai-icon.svg'
import googleGeminiIcon from '@/assets/icons/google-gemini-icon.svg'
import gptAiIcon from '@/assets/icons/gpt-ai-icon.svg'
import qwenAiIcon from '@/assets/icons/qwen-ai-icon.svg'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const OpenAILogo = () => (
  <img src={gptAiIcon} alt="GPT" className="w-3.5 h-3.5 object-contain dark:invert" />
)
const GeminiLogo = () => (
  <img src={googleGeminiIcon} alt="Gemini" className="w-3.5 h-3.5 object-contain" />
)
const ClaudeLogo = () => (
  <img src={claudeAiIcon} alt="Claude" className="w-3.5 h-3.5 object-contain" />
)
const DeepSeekLogo = () => (
  <img src={deepseekAiIcon} alt="DeepSeek" className="w-3.5 h-3.5 object-contain" />
)
const QwenLogo = () => <img src={qwenAiIcon} alt="Qwen" className="w-3.5 h-3.5 object-contain" />

const EMPTY_FORM = {
  name: '',
  code: '',
  model: '',
  key: '',
  isActive: 'Y',
}

export default function AIForm({
  open,
  onClose,
  onSubmit,
  initialData = null,
  plans = [],
  loading = false,
}) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [selectedPlans, setSelectedPlans] = useState([])

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name ?? '',
          code: initialData.code ?? '',
          model: initialData.model ?? '',
          key: initialData.apiKey ?? '',
          isActive: initialData.isActive ?? 'Y',
        })
        setSelectedPlans(initialData.plans?.map((p) => p.id) ?? [])
      } else {
        setFormData(EMPTY_FORM)
        setSelectedPlans([])
      }
    }
  }, [open, initialData])

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  // When AI provider changes, reset model
  const handleCodeChange = (value) => {
    setFormData((prev) => ({ ...prev, code: value, model: '' }))
  }

  const togglePlan = (id) =>
    setSelectedPlans((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      code: formData.code,
      model: formData.model,
      key: formData.key,
      isActive: formData.isActive,
      planIds: selectedPlans,
    })
  }

  const docConfig = formData.code ? AI_DOC_CONFIG[formData.code] : null
  const modelList = formData.code ? (AI_MODELS[formData.code] ?? []) : []
  const selectedModel = modelList.find((m) => m.value === formData.model) ?? null

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg tracking-wide">
                {isEdit ? 'Edit AI Key' : 'Add New AI Key'}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className={labelClass}>AI Provider / Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    placeholder="e.g. GPT Key 4"
                    className={inputClass}
                  />
                </div>

                {/* AI + Model row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* AI selector */}
                  <div className="space-y-2">
                    <label className={labelClass}>AI</label>
                    <Select value={formData.code} onValueChange={handleCodeChange}>
                      <SelectTrigger className={triggerClass}>
                        <SelectValue placeholder="Select AI" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectGroup>
                          <SelectItem value="SETTING-GPT">
                            <div className="flex flex-row items-center gap-2">
                              <OpenAILogo />
                              <span>GPT</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="SETTING-GMN">
                            <div className="flex flex-row items-center gap-2">
                              <GeminiLogo />
                              <span>Gemini</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="SETTING-CLD">
                            <div className="flex flex-row items-center gap-2">
                              <ClaudeLogo />
                              <span>Claude</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="SETTING-DSK">
                            <div className="flex flex-row items-center gap-2">
                              <DeepSeekLogo />
                              <span>Deepseek</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="SETTING-QWN">
                            <div className="flex flex-row items-center gap-2">
                              <QwenLogo />
                              <span>Qwen</span>
                            </div>
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Model selector */}
                  <div className="space-y-2">
                    <label className={labelClass}>Model</label>
                    <Select
                      value={formData.model}
                      onValueChange={set('model')}
                      disabled={!formData.code}
                    >
                      <SelectTrigger
                        className={`${triggerClass} ${
                          !formData.code ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <SelectValue
                          placeholder={formData.code ? 'Select model...' : 'Select AI first'}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectGroup>
                          {modelList.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              <div className="flex flex-col py-0.5">
                                <span className="text-[13px] font-semibold leading-tight">
                                  {m.label}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {/* Selected model badge + doc link */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[26px]">
                      {selectedModel && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-[11px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                          {selectedModel.desc}
                        </span>
                      )}
                      {docConfig && (
                        <a
                          href={docConfig.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[11px] font-semibold transition-all ${docConfig.bgColor} ${docConfig.color}`}
                        >
                          <ExternalLink className={`w-3 h-3 ${docConfig.iconColor}`} />
                          {docConfig.label}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className={labelClass}>API Key</label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={set('key')}
                    placeholder="sk-..."
                    className={inputClass}
                  />
                </div>

                {/* Plans */}
                <div className="space-y-3">
                  <label className={`${labelClass} flex items-center gap-2`}>
                    <Shield className="w-4 h-4 text-blue-500 dark:text-orange-400" />
                    Subscription Plans Access
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                    {plans.map((plan) => {
                      const active = selectedPlans.includes(plan.id)
                      return (
                        <button
                          key={plan.id}
                          onClick={() => togglePlan(plan.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                            active
                              ? 'bg-blue-600 dark:bg-orange-500 border-blue-600 dark:border-orange-500 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-orange-400'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              active
                                ? 'bg-white border-white'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {active && (
                              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-orange-500" />
                            )}
                          </div>
                          <span className="text-[13px] font-bold truncate">{plan.name}</span>
                        </button>
                      )
                    })}
                    {plans.length === 0 && (
                      <p className="text-[12px] text-gray-400 italic col-span-2">
                        Tidak ada plan tersedia
                      </p>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 italic">
                    Only users with the selected plans will be able to use this AI key.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all uppercase tracking-wide"
              >
                {loading ? 'Saving...' : 'Save AI'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
