import { X } from 'lucide-react'
import { useState } from 'react'

import { useSnackbar } from '@/context/SnackbarContext'

export default function DiscountCouponForm({ onClose, onSubmit, loading }) {
  const { showSnackbar } = useSnackbar()

  const [code, setCode] = useState('')
  const [type, setType] = useState('percentage')
  const [amount, setAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expired, setExpired] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!code || !amount || !expired) {
      return showSnackbar('Harap isi semua field yang wajib.', 'error')
    }

    if (type === 'percentage' && parseInt(amount) > 100) {
      return showSnackbar('Diskon persentase tidak boleh lebih dari 100%.', 'error')
    }

    try {
      await onSubmit({
        code,
        type,
        amount: parseInt(amount),
        maxUses: maxUses ? parseInt(maxUses) : null,
        expired,
      })
      showSnackbar('Kupon diskon berhasil dibuat', 'success')
      onClose()
    } catch (err) {
      showSnackbar(err.message || 'Gagal membuat kupon', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buat Kupon Diskon</h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Kode Kupon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="CONTOH: DISKON50"
              className="w-full px-3 py-2 bg-white dark:bg-[#0f141e] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-white uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tipe Diskon <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0f141e] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal (Rp)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Besar Diskon <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={type === 'percentage' ? '50' : '50000'}
                className="w-full px-3 py-2 bg-white dark:bg-[#0f141e] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Batas Penggunaan
              </label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Kosong = Unlimited"
                className="w-full px-3 py-2 bg-white dark:bg-[#0f141e] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kedaluwarsa <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={expired}
                onChange={(e) => setExpired(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-[#0f141e] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Buat Kupon'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
