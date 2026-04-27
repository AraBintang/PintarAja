import { Boxes, CalendarDays, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { useMiscellaneous } from '@/helpers/useMiscellaneous'

function formatMoney(n) {
  return new Intl.NumberFormat('id-ID').format(Number(n ?? 0))
}

function toISODate(d) {
  return d.toISOString().slice(0, 10)
}

function labelDate(iso) {
  try {
    const d = new Date(`${iso}T00:00:00`)
    return d.toLocaleDateString('id-ID', {
      month: 'short',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

function TooltipBox({ active, payload, label, moneyKey }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="text-[12px] font-semibold text-gray-800 dark:text-gray-100 mb-1">{label}</div>
      <div className="space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 text-[12px]">
            <span className="text-gray-600 dark:text-gray-300">{p.name}</span>
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {moneyKey && p.dataKey === moneyKey ? `Rp ${formatMoney(p.value)}` : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MiscellaneousPage() {
  const today = useMemo(() => new Date(), [])
  const [preset, setPreset] = useState('today')
  const [customFrom, setCustomFrom] = useState(toISODate(today))
  const [customTo, setCustomTo] = useState(toISODate(today))

  const range = useMemo(() => {
    const t = new Date()
    const to = toISODate(t)

    if (preset === 'today') return { from: to, to }
    if (preset === '7d') {
      const f = new Date(t)
      f.setDate(f.getDate() - 6)
      return { from: toISODate(f), to }
    }
    if (preset === '30d') {
      const f = new Date(t)
      f.setDate(f.getDate() - 29)
      return { from: toISODate(f), to }
    }
    return { from: customFrom, to: customTo }
  }, [preset, customFrom, customTo])

  const { data, loading, error, refetch } = useMiscellaneous(range)
  const series = data?.series ?? []
  const totals = data?.totals ?? {}
  const topBlogs = data?.topBlogs ?? []

  const statCards = [
    { label: 'New User', value: totals.users ?? 0 },
    { label: 'Successfull transaction', value: totals.tx_paid ?? 0 },
    {
      label: 'Revenue',
      value: `Rp ${formatMoney(totals.tx_revenue ?? 0)}`,
    },
    { label: 'Plagiarism Cheker', value: totals.plagiarism ?? 0 },
    {
      label: 'Waiting Payment',
      value: totals.plagiarism_waiting_payment ?? 0,
    },
    { label: 'Blog Views', value: totals.blog_views ?? 0 },
  ]

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        <div className="flex flex-col gap-4 mb-5 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                  <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                Misc Charts
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
                Chart untuk user, transaction, plagiarism, dan blog views
              </p>
            </div>

            <button
              onClick={refetch}
              className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm w-full sm:w-auto"
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <CalendarDays className="w-4 h-4" />
                <span className="text-[13px] font-semibold">Range</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'today', label: 'Today' },
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '1 Month' },
                  { key: 'custom', label: 'Custom' },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setPreset(p.key)}
                    className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-colors ${
                      preset === p.key
                        ? 'bg-blue-50 dark:bg-orange-900/20 border-blue-200 dark:border-orange-700 text-blue-700 dark:text-orange-400'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {preset === 'custom' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-[12px]"
                  />
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">to</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-[12px]"
                  />
                </div>
              )}

              <div className="lg:ml-auto text-[12px] text-gray-500 dark:text-gray-400">
                {range.from} to {range.to}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-300 text-[13px]">
              {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-3 mb-5 sm:mb-6 w-full">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm min-w-0"
            >
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                {s.label}
              </div>
              <div className="text-[16px] sm:text-[18px] font-extrabold text-gray-800 dark:text-gray-100 mt-1">
                {loading ? '—' : s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">New User / Day</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Jumlah registrasi per hari
              </p>
            </div>
            <div className="h-[290px] px-4 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{
                    left: 0,
                    right: 16,
                    top: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name="Users"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Transaction</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Transaksi berhasil (count) + revenue per hari
              </p>
            </div>
            <div className="h-[290px] px-4 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={series}
                  margin={{
                    left: 0,
                    right: 16,
                    top: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    content={<TooltipBox moneyKey="tx_revenue" />}
                    labelFormatter={(v) => v}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    yAxisId="right"
                    dataKey="tx_revenue"
                    name="Revenue"
                    // fill="#16a34a"
                    // radius={[6, 6, 0, 0]}
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tx_paid"
                    name="Paid"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                Plagiarism Cheker
              </p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Request per hari + waiting payment
              </p>
            </div>
            <div className="h-[290px] px-4 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{
                    left: 0,
                    right: 16,
                    top: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="plagiarism"
                    name="Total"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="plagiarism_waiting_payment"
                    name="Waiting Payment"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Blog Views</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Event views per hari (mulai tercatat setelah migration)
              </p>
            </div>
            <div className="h-[290px] px-4 py-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={series}
                  margin={{
                    left: 0,
                    right: 16,
                    top: 8,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickFormatter={labelDate} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    dataKey="blog_views"
                    name="Views"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="px-5 pb-4">
              <div className="text-[12px] font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Top Blog
              </div>
              {topBlogs.length === 0 ? (
                <div className="text-[12px] text-gray-500 dark:text-gray-400">Belum ada data</div>
              ) : (
                <div className="space-y-2">
                  {topBlogs.map((b) => (
                    <a
                      key={b.id}
                      href={`${window.location.origin}/blog/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-4 text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 py-1 -mx-2 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {b.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 truncate">
                          {window.location.origin}/blog/{b.slug}
                        </div>
                      </div>
                      <div className="font-extrabold text-gray-800 dark:text-gray-100">
                        {b.views}
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
