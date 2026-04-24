import { addDays, format, isFuture, parseISO } from 'date-fns'
import { X } from 'lucide-react'
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
  name: '',
  email: '',
  password: '',
  phone: '',
  status: 'Y',
  plan: '1',
  role: 'U',
  subsMode: 'days', // 'days' | 'date'
  subsDays: '',
  subsDate: '',
}

const PRESET_DAYS = [
  { label: '30 hari (1 bulan)', value: '30' },
  { label: '60 hari (2 bulan)', value: '60' },
  { label: '90 hari (3 bulan)', value: '90' },
  { label: '180 hari (6 bulan)', value: '180' },
  { label: '365 hari (1 tahun)', value: '365' },
  { label: 'Custom...', value: 'custom' },
]

export default function UserForm({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [customDays, setCustomDays] = useState('')

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.M_UserFullName ?? '',
          email: initialData.M_UserEmail ?? '',
          password: '',
          phone: initialData.M_UserPhone ?? '',
          status: initialData.M_UserIsActive ?? 'Y',
          plan: String(initialData.M_UserPlan ?? '1'),
          role: initialData.M_UserRole ?? 'U',
          subsMode: 'days',
          subsDays: '',
          subsDate: '',
        })
      } else {
        setFormData(EMPTY_FORM)
      }
      setCustomDays('')
    }
  }, [open, initialData])

  if (!open) return null

  const isPremium = formData.plan !== '1'

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  // Compute subsDay to send to backend
  const computeSubsDay = () => {
    if (!isPremium) return undefined

    if (formData.subsMode === 'date' && formData.subsDate) {
      const target = parseISO(formData.subsDate)
      const now = new Date()
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
      return diff > 0 ? diff : undefined
    }

    if (formData.subsMode === 'days') {
      const val = formData.subsDays === 'custom' ? customDays : formData.subsDays
      const days = parseInt(val, 10)
      return days > 0 ? days : undefined
    }

    return undefined
  }

  // Preview: what date will the subscription expire?
  const previewExpiry = () => {
    const subsDay = computeSubsDay()
    if (!subsDay) return null

    if (isEdit && initialData?.M_UserSubsExp) {
      const existing = parseISO(initialData.M_UserSubsExp)
      const base = isFuture(existing) ? existing : new Date()
      return format(addDays(base, subsDay), 'dd MMM yyyy')
    }
    return format(addDays(new Date(), subsDay), 'dd MMM yyyy')
  }

  const currentExpiry =
    isEdit && initialData?.M_UserSubsExp
      ? format(parseISO(initialData.M_UserSubsExp), 'dd MMM yyyy')
      : null

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      plan: Number(formData.plan),
      isActive: formData.status,
      ...(formData.password && { password: formData.password }),
      ...(computeSubsDay() !== undefined && { subsDay: computeSubsDay() }),
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  const tabClass = (active) =>
    `px-4 py-1.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
      active
        ? 'bg-blue-600 dark:bg-orange-500 text-white'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
    }`

  const expiry = previewExpiry()

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
                {isEdit ? 'Edit User' : 'Input Data User'}
              </h3>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={set('name')}
                    placeholder="e.g. John Doe"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={set('email')}
                    placeholder="e.g. john@example.com"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={set('phone')}
                    placeholder="e.g. 08123456789"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2 mb-2">
                  <label className={labelClass}>
                    Password{' '}
                    {isEdit && (
                      <span className="text-gray-400 font-normal">
                        (kosongkan jika tidak ingin mengubah)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={set('password')}
                    placeholder="••••••••••••"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Active Status</label>
                  <Select value={formData.status} onValueChange={set('status')}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="Y">Active</SelectItem>
                        <SelectItem value="N">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Role</label>
                  <Select value={formData.role} onValueChange={set('role')}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="U">User</SelectItem>
                        <SelectItem value="A">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Subscription Plan</label>
                  <Select value={formData.plan} onValueChange={set('plan')}>
                    <SelectTrigger className={triggerClass}>
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="1">Free Account</SelectItem>
                        <SelectItem value="2">Premium Plan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* ── Subscription Expiry — only shown when plan != 1 ── */}
                {isPremium && (
                  <div className="col-span-1 md:col-span-2 border border-blue-100 dark:border-orange-900/40 rounded-2xl p-4 bg-blue-50/50 dark:bg-orange-900/10 space-y-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-blue-700 dark:text-orange-400">
                          Subscription Expiry
                        </p>
                        {isEdit && currentExpiry && (
                          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">
                            Saat ini:{' '}
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {currentExpiry}
                            </span>
                            {initialData?.M_UserSubsExp &&
                            isFuture(parseISO(initialData.M_UserSubsExp))
                              ? ' (masih aktif, akan di-extend)'
                              : ' (expired, dihitung dari sekarang)'}
                          </p>
                        )}
                      </div>

                      {/* Toggle tabs */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                        <button
                          type="button"
                          className={tabClass(formData.subsMode === 'days')}
                          onClick={() => setFormData((p) => ({ ...p, subsMode: 'days' }))}
                        >
                          Pilih Hari
                        </button>
                        <button
                          type="button"
                          className={tabClass(formData.subsMode === 'date')}
                          onClick={() => setFormData((p) => ({ ...p, subsMode: 'date' }))}
                        >
                          Pilih Tanggal
                        </button>
                      </div>
                    </div>

                    {/* Mode: select days */}
                    {formData.subsMode === 'days' && (
                      <div className="space-y-3">
                        <Select value={formData.subsDays} onValueChange={set('subsDays')}>
                          <SelectTrigger className={triggerClass}>
                            <SelectValue placeholder="Pilih durasi..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectGroup>
                              {PRESET_DAYS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        {formData.subsDays === 'custom' && (
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="1"
                              max="9999"
                              value={customDays}
                              onChange={(e) => setCustomDays(e.target.value)}
                              placeholder="Jumlah hari"
                              className={inputClass}
                            />
                            <span className="text-[13px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              hari
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mode: pick date */}
                    {formData.subsMode === 'date' && (
                      <input
                        type="date"
                        value={formData.subsDate}
                        min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                        onChange={set('subsDate')}
                        className={inputClass}
                      />
                    )}

                    {/* Preview expiry */}
                    {expiry && (
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        <span className="text-gray-500 dark:text-gray-400">
                          Akan expire pada:{' '}
                          <span className="font-semibold text-gray-800 dark:text-gray-100">
                            {expiry}
                          </span>
                        </span>
                      </div>
                    )}
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
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all uppercase tracking-wide"
              >
                {loading ? 'Saving...' : 'Save User'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
