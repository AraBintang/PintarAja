import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Crown,
  Diamond,
  Filter,
  Plus,
  Search,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import CouponForm from '@/components/coupon/CouponForm'
import DeleteModal from '@/components/DeleteModal'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSnackbar } from '@/context/SnackbarContext'
import { useCoupons } from '@/helpers/useCoupons'
import { Debounce } from '@/utils/Debounce'

const PAGE_SIZE = 10

function getStatusConfig(status) {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900/30',
        dot: 'bg-emerald-500',
        pulse: true,
      }
    case 'used':
      return {
        label: 'Used',
        bg: 'bg-blue-50 dark:bg-orange-900/20',
        text: 'text-blue-700 dark:text-orange-400',
        border: 'border-blue-100 dark:border-orange-900/30',
        dot: 'bg-blue-500 dark:bg-orange-400',
        pulse: false,
      }
    default:
      return {
        label: 'Expired',
        bg: 'bg-gray-50 dark:bg-gray-700',
        text: 'text-gray-500 dark:text-gray-400',
        border: 'border-gray-100 dark:border-gray-600',
        dot: 'bg-gray-400',
        pulse: false,
      }
  }
}

function getTypeBadge(planDays = '') {
  if (planDays >= 180)
    return {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      Icon: Crown,
    }
  if (planDays >= 90)
    return {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
      Icon: Sparkles,
    }
  if (planDays >= 30)
    return {
      bg: 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20',
      text: 'text-violet-700 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30',
      Icon: Diamond,
    }
  return {
    bg: 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    text: 'text-blue-700 dark:text-orange-400',
    border: 'border-blue-100 dark:border-orange-900/30',
    Icon: Zap,
  }
}

function deriveCouponStatus(coupon) {
  if (coupon.used === 'Y' || coupon.userEmail) return 'used'
  if (coupon.expired && coupon.expired !== '-' && coupon.expired !== '~') {
    if (new Date(coupon.expired) < new Date()) return 'expired'
  }
  return 'active'
}

export default function CouponPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [copiedId, setCopiedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const { coupons, plans, pagination, summary, loading, createCoupon, deleteCoupon } = useCoupons({
    search: debouncedSearch,
    page,
    perPage: PAGE_SIZE,
  })

  const displayCoupons = filterStatus
    ? coupons.filter((c) => deriveCouponStatus(c) === filterStatus)
    : coupons

  const stats = [
    {
      label: 'Total Coupon',
      value: summary.total,
      icon: Ticket,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    {
      label: 'Active',
      value: summary.active,
      icon: CheckCircle2,
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Used',
      value: summary.used,
      icon: Tag,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    {
      label: 'Expired',
      value: summary.expired,
      icon: XCircle,
      bgLight: 'bg-gray-100 dark:bg-gray-700/50',
      textColor: 'text-gray-500 dark:text-gray-400',
    },
  ]

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      await createCoupon(payload)
      showSnackbar('success', 'Kupon berhasil digenerate')
      setIsFormOpen(false)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteCoupon(deleteTarget.id)
      showSnackbar('success', 'Kupon berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const totalPages = pagination?.last_page ?? 1
  const currentPage = pagination?.current_page ?? 1

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const selectTriggerClass =
    'w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0'

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Coupon Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola kode kupon, diskon, dan masa berlaku
            </p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div
                className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}
              >
                <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
              </div>
              <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 block mt-2 sm:mt-3">
                {loading ? '—' : stat.value}
              </span>
              <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 sm:mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-[400px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search code or email..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
                showFilters
                  ? 'bg-blue-50 dark:bg-orange-900/20 border-blue-200 dark:border-orange-700 text-blue-700 dark:text-orange-400'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col sm:flex-row gap-3">
              <Select
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="used">Digunakan</SelectItem>
                    <SelectItem value="expired">Kadaluarsa</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {['Coupon Code', 'Type', 'Valid Until', 'Status', 'Used By', 'Action'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 3 ? 'text-center' : i === 5 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : displayCoupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada kupon ditemukan
                    </td>
                  </tr>
                ) : (
                  displayCoupons.map((coupon) => {
                    const status = deriveCouponStatus(coupon)
                    const statusConfig = getStatusConfig(status)
                    const typeBadge = getTypeBadge(coupon.days ?? 0)
                    return (
                      <tr
                        key={coupon.id}
                        className="hover:bg-blue-50/20 dark:hover:bg-orange-900/10 transition-colors"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <code className="text-[14px] font-bold text-gray-800 dark:text-gray-100 tracking-wide bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-600 font-mono">
                              {coupon.code}
                            </code>
                            {status == 'active' && (
                              <button
                                onClick={() => handleCopy(coupon.code, coupon.id)}
                                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                title="Copy code"
                              >
                                {copiedId === coupon.id ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}
                          >
                            <typeBadge.Icon className="w-3.5 h-3.5" />
                            {coupon.planName}
                            {` ${coupon.days} Hari`}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {!coupon.expired || coupon.expired === '-' || coupon.expired === '~' ? (
                            <span className="text-[13px] text-gray-400">—</span>
                          ) : (
                            <span className="text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {coupon.expired}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} ${statusConfig.pulse ? 'animate-pulse' : ''}`}
                            />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                          {coupon.userEmail ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setDeleteTarget(coupon)}
                            title="Hapus"
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Viewing{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {pagination ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
                {pagination ? Math.min(currentPage * PAGE_SIZE, pagination.total) : 0}
              </span>{' '}
              from{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {pagination?.total ?? 0}
              </span>{' '}
              coupon
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((p, i) =>
                p === '...' ? (
                  <span key={`e-${i}`} className="text-gray-400 text-sm px-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-medium text-[13px] transition-colors ${
                      currentPage === p
                        ? 'bg-blue-600 dark:bg-orange-500 text-white shadow-sm shadow-blue-200 dark:shadow-orange-900/30'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CouponForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        plans={plans}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'coupon'}
        name={deleteTarget?.code ?? ''}
      />
    </div>
  )
}
