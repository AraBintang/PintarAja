import { Dices, KeyRound, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
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
  codeMode: 'auto', // 'auto' | 'custom'
  customCode: '',
  maxUses: '', // '' = unlimited, angka = terbatas
}

export default function CouponForm({ open, onClose, onSubmit, plans = [], loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)

  useEffect(() => {
    if (open) setFormData(EMPTY_FORM)
  }, [open])

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))
  const setDirect = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))

  const isCustom = formData.codeMode === 'custom'

  const handleSubmit = () => {
    onSubmit({
      planId: formData.planId,
      days: Number(formData.days),
      expired: formData.expired,
      count: isCustom ? 1 : Number(formData.count),
      codeMode: formData.codeMode,
      customCode: isCustom ? formData.customCode.trim().toUpperCase() : undefined,
      maxUses: formData.maxUses === '' ? null : Number(formData.maxUses),
    })
  }

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
              <h3 className="text-white font-bold text-lg tracking-wide uppercase">
                Generate Coupons
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Plan & Duration */}
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
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Duration (days)</label>
                  <input
                    type="number"
                    value={formData.days}
                    onChange={set('days')}
                    placeholder="e.g. 30"
                    min={1}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Expired & Max Uses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={labelClass}>Expired Date</label>
                  <input
                    type="date"
                    value={formData.expired}
                    onChange={set('expired')}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>
                    Max Uses{' '}
                    <span className="font-normal text-gray-400 dark:text-gray-500">(opsional)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={set('maxUses')}
                    placeholder="Kosongkan = tidak terbatas"
                    min={1}
                    className={inputClass}
                  />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
                    Jumlah maksimal pengguna yang bisa redeem kupon ini. Biarkan kosong jika tidak
                    ada batas.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-700" />

              {/* Code Mode Toggle */}
              <div className="space-y-3">
                <label className={labelClass}>Coupon Code</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDirect('codeMode', 'auto')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                      !isCustom
                        ? 'bg-blue-600 dark:bg-orange-500 text-white border-blue-600 dark:border-orange-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Dices className="w-4 h-4" />
                    Auto Generate
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirect('codeMode', 'custom')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] font-semibold transition-all ${
                      isCustom
                        ? 'bg-blue-600 dark:bg-orange-500 text-white border-blue-600 dark:border-orange-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                    Custom Code
                  </button>
                </div>

                {isCustom ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={formData.customCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          customCode: e.target.value.toUpperCase().replace(/\s/g, ''),
                        }))
                      }
                      placeholder="Contoh: PROMO2025"
                      maxLength={32}
                      className={inputClass + ' uppercase tracking-widest font-mono font-bold'}
                    />
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
                      Kode akan otomatis diubah ke huruf kapital. Pastikan kode belum pernah
                      digunakan sebelumnya.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Jumlah Coupon</label>
                      <input
                        type="number"
                        value={formData.count}
                        onChange={set('count')}
                        placeholder="e.g. 10"
                        min={1}
                        className={inputClass}
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
                      Kode akan di-generate secara acak (10 karakter alfanumerik).
                    </p>
                  </div>
                )}
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
                {loading ? 'Generating...' : 'Generate Coupon'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
