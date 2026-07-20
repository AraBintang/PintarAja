import {
  CheckCircle2,
  Copy,
  Plus,
  Search,
  Ticket,
  Trash2,
  XCircle,
  Percent,
} from 'lucide-react'
import { useState } from 'react'

import DiscountCouponForm from '@/components/coupon/DiscountCouponForm'
import Pagination from '@/components/Pagination'
import { useSnackbar } from '@/context/SnackbarContext'
import { useDiscountCoupons } from '@/helpers/useDiscountCoupons'
import { Debounce } from '@/utils/Debounce'

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount)
}

const PAGE_SIZE = 10

export default function DiscountCouponPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [copiedId, setCopiedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const { coupons, pagination, loading, createCoupon, toggleCoupon } = useDiscountCoupons({
    search: debouncedSearch,
    page,
    perPage: PAGE_SIZE,
  })

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggle = async (coupon) => {
    const action = coupon.M_DiscountCouponIsActive ? 'menonaktifkan' : 'mengaktifkan'
    if (confirm(`Yakin ingin ${action} kupon ${coupon.M_DiscountCouponCode}?`)) {
      try {
        setActionLoading(true)
        await toggleCoupon(coupon.M_DiscountCouponID)
        showSnackbar(`Kupon berhasil diupdate`, 'success')
      } catch (err) {
        showSnackbar(err.message, 'error')
      } finally {
        setActionLoading(false)
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kupon Diskon</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola kode promo potongan harga untuk pembayaran pelanggan.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Buat Kupon Diskon
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#1a1f2e] border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kode kupon..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#0f141e] border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 font-medium">Kode Kupon</th>
                <th className="px-6 py-4 font-medium">Tipe & Nominal</th>
                <th className="px-6 py-4 font-medium">Penggunaan</th>
                <th className="px-6 py-4 font-medium">Kedaluwarsa</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                    Memuat data...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Ticket className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    Belum ada kupon diskon.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.M_DiscountCouponExpired) < new Date()
                  const isExhausted = coupon.M_DiscountCouponMaxUses !== null && coupon.M_DiscountCouponUsedCount >= coupon.M_DiscountCouponMaxUses
                  const isActive = coupon.M_DiscountCouponIsActive && !isExpired && !isExhausted

                  return (
                    <tr key={coupon.M_DiscountCouponID} className="group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                      {/* Code */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded font-mono text-sm tracking-wide">
                            {coupon.M_DiscountCouponCode}
                          </code>
                          <button
                            onClick={() => handleCopy(coupon.M_DiscountCouponCode, coupon.M_DiscountCouponID)}
                            className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedId === coupon.M_DiscountCouponID ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Type & Nominal */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {coupon.M_DiscountCouponType === 'percentage' 
                              ? `${coupon.M_DiscountCouponAmount}%` 
                              : formatRupiah(coupon.M_DiscountCouponAmount)
                            }
                          </span>
                          <span className="text-xs text-gray-500">
                            {coupon.M_DiscountCouponType === 'percentage' ? 'Persentase' : 'Nominal Tetap'}
                          </span>
                        </div>
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">{coupon.M_DiscountCouponUsedCount}</span>
                          <span className="text-gray-400">/</span>
                          <span className={coupon.M_DiscountCouponMaxUses ? "font-medium" : "text-gray-400"}>
                            {coupon.M_DiscountCouponMaxUses ?? '∞'}
                          </span>
                        </div>
                      </td>

                      {/* Expired */}
                      <td className="px-6 py-4">
                        <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {new Date(coupon.M_DiscountCouponExpired).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {isActive ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={actionLoading}
                          onClick={() => handleToggle(coupon)}
                          className={`p-2 rounded-lg transition-colors ${
                            coupon.M_DiscountCouponIsActive 
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
                              : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                          }`}
                          title={coupon.M_DiscountCouponIsActive ? "Nonaktifkan" : "Aktifkan"}
                        >
                          {coupon.M_DiscountCouponIsActive ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.total > PAGE_SIZE && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10">
            <Pagination
              currentPage={page}
              totalPages={pagination.last_page}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {isFormOpen && (
        <DiscountCouponForm
          loading={actionLoading}
          onClose={() => setIsFormOpen(false)}
          onSubmit={async (payload) => {
            setActionLoading(true)
            await createCoupon(payload)
            setActionLoading(false)
            setIsFormOpen(false)
          }}
        />
      )}
    </div>
  )
}
