import { X } from 'lucide-react'
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
}

export default function UserForm({ open, onClose, onSubmit, initialData = null, loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      setFormData(
        initialData
          ? {
              name: initialData.M_UserFullName ?? '',
              email: initialData.M_UserEmail ?? '',
              password: '',
              phone: initialData.M_UserPhone ?? '',
              status: initialData.M_UserIsActive ?? 'Y',
              plan: String(initialData.M_UserPlan ?? '1'),
              role: initialData.M_UserRole ?? 'U',
            }
          : EMPTY_FORM,
      )
    }
  }, [open, initialData])

  if (!open) return null

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  const handleSubmit = () => {
    onSubmit({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      plan: Number(formData.plan),
      isActive: formData.status,
      ...(formData.password && { password: formData.password }),
    })
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg tracking-wide">
            {isEdit ? 'Edit User' : 'Input Data User'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
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
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
