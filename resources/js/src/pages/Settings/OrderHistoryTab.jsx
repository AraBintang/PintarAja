import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const FILTERS = [
  { key: 'Semua', label: 'All' },
  { key: 'Menunggu', label: 'Waiting' },
  { key: 'Berhasil', label: 'Paid' },
  { key: 'Kadaluarsa', label: 'Expired' },
]

const STATUS_MAP = {
  berhasil: {
    label: 'Paid',
    Icon: CheckCircle2,
    color: 'text-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  'menunggu pembayaran': {
    label: 'Waiting',
    Icon: Clock,
    color: 'text-amber-500',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  },
  kadaluarsa: {
    label: 'Expired',
    Icon: XCircle,
    color: 'text-red-400',
    badge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  },
  gagal: {
    label: 'Failed',
    Icon: XCircle,
    color: 'text-red-400',
    badge: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  },
  refund: {
    label: 'Refunded',
    Icon: RefreshCw,
    color: 'text-blue-400',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
}

function getStatusCfg(status) {
  return (
    STATUS_MAP[status?.toLowerCase()] ?? {
      label: 'Not yet defined',
      Icon: AlertCircle,
      color: 'text-gray-400',
      badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    }
  )
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

function formatDate(dateString) {
  if (!dateString) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

export default function OrderHistoryTab() {
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Semua')

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await request('/payments', { method: 'GET' })
      setOrders(data.data || [])
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Navigate ke payment/detail dengan returnUrl yang mengarah ke settings tab history
  const handleOpenDetail = (order) => {
    navigate('/payment', {
      state: {
        referenceId: order.referenceId,
        fromHistory: true,
        // returnUrl dipakai tombol Kembali di PaymentDetailPage
        returnUrl: window.location.pathname,
      },
    })
  }

  const filtered = orders.filter((order) =>
    activeFilter === 'Semua'
      ? true
      : order.status?.toLowerCase().includes(activeFilter.toLowerCase()),
  )

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            Order History
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Riwayat seluruh pembayaran Anda
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setActiveFilter(f.key)
                console.log(activeFilter)
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f.key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-100 dark:border-gray-800 p-5"
              >
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
            <ShoppingBag className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400 dark:text-gray-600">
              {activeFilter === 'Semua' ? 'No transactions yet' : 'No transaction for this status'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((order) => {
              const { label, Icon: StatusIcon, color, badge } = getStatusCfg(order.status)
              return (
                <button
                  key={order.id}
                  onClick={() => handleOpenDetail(order)}
                  className="w-full text-left rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all p-4 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {order.planName}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                            {order.referenceId}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 mt-0.5 group-hover:text-gray-500 transition-colors" />
                      </div>

                      <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${badge}`}
                        >
                          <StatusIcon className={`w-3 h-3 ${color}`} />
                          {label}
                        </span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                          Rp {formatPrice(order.amount)}
                        </span>
                        {order.method && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-medium">
                            {order.method}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
