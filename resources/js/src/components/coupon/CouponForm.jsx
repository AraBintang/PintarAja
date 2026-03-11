import { Crown, Diamond, X, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EMPTY_FORM = {
  planId: '',
  days: '',
  expired: '',
  count: 1,
}

export default function CouponForm({ open, onClose, onSubmit, plans = [], loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    if (open) setFormData(EMPTY_FORM)
  }, [open])

  if (!open) return null

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  const handleSubmit = () => {
    onSubmit({
      planId: Number(formData.planId),
      days: Number(formData.days),
      expired: formData.expired,
      count: Number(formData.count),
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  const getPlanIcon = (name = '') => {
    if (name.includes('Tahun')) return <Crown className="w-3.5 h-3.5 text-amber-500" />
    if (name.includes('30')) return <Diamond className="w-3.5 h-3.5 text-violet-500" />
    return <Zap className="w-3.5 h-3.5 text-blue-500" />
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg tracking-wide uppercase">Generate Coupons</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Coupon Type / Plan</label>
              <Select value={formData.planId} onValueChange={set('planId')}>
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Pilih Plan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={String(plan.id)}>
                        <span className="inline-flex items-center gap-2">
                          {getPlanIcon(plan.name)}
                          {plan.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Durasi (hari)</label>
              <input
                type="number"
                value={formData.days}
                onChange={set('days')}
                placeholder="e.g. 30"
                min={1}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Tanggal Kadaluarsa</label>
              <input
                type="date"
                value={formData.expired}
                onChange={set('expired')}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Jumlah Kupon</label>
              <input
                type="number"
                value={formData.count}
                onChange={set('count')}
                placeholder="e.g. 10"
                min={1}
                className={inputClass}
              />
            </div>
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
