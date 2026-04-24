import {
  Calendar,
  CheckCircle2,
  Copy,
  Crown,
  Diamond,
  Filter,
  Infinity,
  Plus,
  Search,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  XCircle,
  Zap,
} from 'lucide-react'
import { useState } from 'react'

import CouponForm from '@/components/coupon/CouponForm'
import DeleteModal from '@/components/DeleteModal'
import Pagination from '@/components/Pagination'
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function deriveCouponStatus(coupon) {
  const isExpiredDate =
    coupon.expired &&
    coupon.expired !== '-' &&
    coupon.expired !== '~' &&
    new Date(coupon.expired) < new Date()

  if (isExpiredDate) return 'expired'

  const maxUses = coupon.maxUses ?? null
  const usedCount = coupon.usedCount ?? 0

  if (maxUses !== null && usedCount >= maxUses) return 'exhausted'

  // single-use legacy: used = 'Y' and no maxUses set
  if (maxUses === null && (coupon.used === 'Y' || coupon.userEmail)) return 'used'

  return 'active'
}

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
    case 'exhausted':
      return {
        label: 'Exhausted',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-100 dark:border-rose-900/30',
        dot: 'bg-rose-500',
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

// ─── UsageCell ─────────────────────────────────────────────────────────────────

function UsageCell({ coupon }) {
  const maxUses = coupon.maxUses ?? null
  const usedCount = coupon.usedCount ?? 0
  const isMulti = maxUses !== null || usedCount > 1

  // Single-use legacy
  if (!isMulti) {
    return (
      <span className="text-[13px] text-gray-500 dark:text-gray-400 truncate max-w-[180px] block">
        {coupon.userEmail ?? '—'}
      </span>
    )
  }

  // Multi-use with limit
  if (maxUses !== null) {
    const pct = Math.min((usedCount / maxUses) * 100, 100)
    const remaining = maxUses - usedCount
    const isExhausted = remaining <= 0

    return (
      <div className="space-y-1.5 min-w-[140px]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-200">
            {usedCount}
            <span className="text-gray-400 dark:text-gray-500 font-normal"> / {maxUses}</span>
          </span>
          <span
            className={`text-[11px] font-medium ${isExhausted ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {isExhausted ? 'Habis' : `Sisa ${remaining}`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isExhausted ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  // Multi-use unlimited
  return (
    <div className="flex items-center gap-1.5">
      <Infinity className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-[13px] text-gray-600 dark:text-gray-300 font-semibold">
        {usedCount}
      </span>
      <span className="text-[12px] text-gray-400 dark:text-gray-500">pengguna</span>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

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
      label: 'Used / Exhausted',
      value: (summary.used ?? 0) + (summary.exhausted ?? 0),
      icon: Users,
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

  const selectTriggerClass =
    'w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0'

  // ─── column headers ─────────────────────────────────────────────────────────
  const headers = [
    { label: 'No.', align: '' },
    { label: 'Coupon Code', align: '' },
    { label: 'Type', align: '' },
    { label: 'Valid Until', align: '' },
    { label: 'Status', align: 'text-center' },
    { label: 'Usage', align: '' },
    { label: 'Action', align: 'text-right' },
  ]

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
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}
                >
                  <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100 block mt-2 sm:mt-3">
                  {loading ? '—' : stat.value}
                </span>
              </div>
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
                    <SelectItem value="used">Digunakan (Single)</SelectItem>
                    <SelectItem value="exhausted">Exhausted</SelectItem>
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
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {headers.map((h) => (
                    <th
                      key={h.label}
                      className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${h.align}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : displayCoupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada kupon ditemukan
                    </td>
                  </tr>
                ) : (
                  displayCoupons.map((coupon, index) => {
                    const status = deriveCouponStatus(coupon)
                    const statusConfig = getStatusConfig(status)
                    const typeBadge = getTypeBadge(coupon.days ?? 0)
                    const isActive = status === 'active'

                    return (
                      <tr
                        key={coupon.id}
                        className="hover:bg-blue-50/20 dark:hover:bg-orange-900/10 transition-colors"
                      >
                        <td className="px-6 py-4 text-[13px] font-medium text-gray-400">
                          {(pagination?.current_page - 1) * PAGE_SIZE + index + 1}.
                        </td>

                        {/* Code */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2">
                            <code className="text-[14px] font-bold text-gray-800 dark:text-gray-100 tracking-wide bg-gray-50 dark:bg-gray-700 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-600 font-mono">
                              {coupon.code}
                            </code>
                            {isActive && (
                              <button
                                onClick={() => handleCopy(coupon.code, coupon.id)}
                                className="w-7 h-7 rounded-md bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-center text-gray-800 dark:text-gray-100 transition-colors"
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
                          {/* Multi-use badge */}
                          {(coupon.maxUses !== null || (coupon.usedCount ?? 0) > 1) && (
                            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900/30 px-1.5 py-0.5 rounded-md">
                              <Users className="w-2.5 h-2.5" />
                              Multi-use
                            </span>
                          )}
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${typeBadge.bg} ${typeBadge.text} ${typeBadge.border}`}
                          >
                            <typeBadge.Icon className="w-3.5 h-3.5" />
                            {coupon.planName} {coupon.days} Hari
                          </span>
                        </td>

                        {/* Valid Until */}
                        <td className="px-4 py-3.5">
                          {!coupon.expired || coupon.expired === '-' || coupon.expired === '~' ? (
                            <span className="text-[13px] text-gray-400">—</span>
                          ) : (
                            <span className="text-[13px] text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(coupon.expired).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </td>

                        {/* Status */}
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

                        {/* Usage */}
                        <td className="px-4 py-3.5">
                          <UsageCell coupon={coupon} />
                        </td>

                        {/* Action */}
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
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination?.current_page}
              totalPages={pagination.last_page}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="coupons"
              className="px-6 py-4 border-t border-gray-100 dark:border-gray-700"
            />
          )}
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
