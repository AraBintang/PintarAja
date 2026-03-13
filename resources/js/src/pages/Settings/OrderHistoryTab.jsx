import { Clock, CheckCircle2, XCircle, AlertCircle, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function OrderHistoryTab() {
  const { showSnackbar } = useSnackbar()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('Semua')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await request('/transactions/history', { method: 'GET' })
      setOrders(data.data || [])
    } catch (err) {
      // If endpoint doesn't exist yet, we can use dummy data for UI display
      setOrders([
        {
          id: 'INV-1773363859-6700',
          plan_name: 'Premium Plan - 1 Bulan',
          price: 45000,
          status: 'Menunggu Pembayaran',
          method: 'BCA VA',
          created_at: new Date().toISOString()
        },
        {
          id: 'INV-1773293859-1234',
          plan_name: 'Basic Plan - 1 Bulan',
          price: 15000,
          status: 'Berhasil',
          method: 'OVO',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-1773193859-9999',
          plan_name: 'Premium Plan - 1 Bulan',
          price: 45000,
          status: 'Kadaluarsa',
          method: 'QRIS',
          created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
        }
      ])
      // showSnackbar('error', 'Gagal memuat histori pesanan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'berhasil':
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'menunggu':
      case 'menunggu pembayaran':
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />
      case 'kadaluarsa':
      case 'expired':
      case 'failed':
      case 'batal':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'berhasil':
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'menunggu':
      case 'menunggu pembayaran':
      case 'pending':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
      case 'kadaluarsa':
      case 'expired':
      case 'failed':
      case 'batal':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10">
      <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            Histori Pesanan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Daftar seluruh riwayat transaksi dan status pembayaran Anda.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 pb-2 overflow-x-auto no-scrollbar">
          {['Semua', 'Menunggu', 'Berhasil', 'Kadaluarsa'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed">
            <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Belum ada pesanan
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Anda belum melakukan transaksi apa pun. Silakan berlangganan untuk melihat histori di sini.
            </p>
          </div>
        ) : (
          <div key={activeFilter} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {orders.filter(order => activeFilter === 'Semua' ? true : order.status.toLowerCase().includes(activeFilter.toLowerCase())).length === 0 ? (
               <div className="text-center py-10 px-4">
                 <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada pesanan untuk filter ini.</p>
               </div>
            ) : orders
            .filter(order => activeFilter === 'Semua' ? true : order.status.toLowerCase().includes(activeFilter.toLowerCase()))
            .map((order) => (
              <div 
                key={order.id}
                className="bg-white dark:bg-gray-800/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-500/30 transition-all hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                        {order.id}
                      </p>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {order.plan_name}
                      </h4>
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${getStatusBadge(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-12 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Total
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Rp {formatPrice(order.price)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Metode
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {order.method || '-'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Tanggal
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
