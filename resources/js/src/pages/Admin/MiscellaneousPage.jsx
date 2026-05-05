import {
  Bot,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  FileSearch,
  FileText,
  MonitorSmartphone,
  RefreshCcw,
  Ticket,
  Users,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
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

import { useSnackbar } from '@/context/SnackbarContext'
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
    return d.toLocaleDateString('id-ID', { month: 'short', day: '2-digit' })
  } catch {
    return iso
  }
}

function TooltipBox({ active, payload, label, moneyKey }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white/98 dark:bg-gray-900/98 backdrop-blur px-3.5 py-2.5 shadow-xl">
      <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6 text-[12px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-gray-500 dark:text-gray-400">{p.name}</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-100">
              {moneyKey && p.dataKey === moneyKey ? `Rp ${formatMoney(p.value)}` : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, subtext, loading, accent = '#2563eb' }) {
  return (
    <div className="relative bg-white dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/60 overflow-hidden group hover:shadow-md transition-shadow duration-200">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}80, ${accent})` }}
      />
      <div className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-[22px] font-black text-gray-800 dark:text-gray-100 leading-none">
        {loading ? <span className="text-gray-200 dark:text-gray-700">—</span> : value}
      </div>
      {subtext && !loading && (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 font-medium">
          {subtext}
        </div>
      )}
    </div>
  )
}

// ─── Category Section ─────────────────────────────────────────────────────────
function StatSection({ title, icon: Icon, color, bgColor, borderColor, children }) {
  return (
    <div className={`rounded-2xl border p-4 ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-white/60 dark:bg-black/20`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className={`text-[12px] font-bold uppercase tracking-widest ${color}`}>{title}</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// ─── Chart Card ───────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, right = false }) {
  return (
    <section className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden pb-2">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">{title}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className={`h-[260px] ${right ? 'pr-0' : 'pr-8'} py-3`}>{children}</div>
    </section>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MiscellaneousPage() {
  const today = useMemo(() => new Date(), [])
  const { showSnackbar } = useSnackbar()
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

  const { data, loading, refetch } = useMiscellaneous(range, {
    onError: (err) => showSnackbar('error', err?.message ?? 'Gagal memuat data'),
  })

  const series = data?.series ?? []
  const totals = data?.totals ?? {}
  const topBlogs = data?.topBlogs ?? []
  const deviceBreakdown = data?.deviceBreakdown ?? []
  const recentActiveUsers = data?.recentActiveUsers ?? []

  const PRESETS = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '1 Month' },
    { key: 'custom', label: 'Custom' },
  ]

  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const chartAxis = { tick: { fontSize: 11, fill: '#9ca3af' }, tickLine: false, axisLine: false }

  return (
    <div className="flex-1 h-full bg-[#f4f5f7] dark:bg-[#0c1017] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-5 pb-8 pt-16">
      <div className="max-w-[1280px] mx-auto space-y-5">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2.5 tracking-tight">
              <div className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Boxes className="w-5 h-5 text-white" />
              </div>
              Misc Charts
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-[12px] mt-1 ml-0.5">
              User · Transaksi · Plagiarism · Blog · Coupon · AI Features
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-[13px] w-full sm:w-auto shadow-sm"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* ── Filter ── */}
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 shrink-0">
              <CalendarDays className="w-4 h-4" />
              <span className="text-[12px] font-bold uppercase tracking-widest">Range</span>
            </div>
            <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl w-fit">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    preset === p.key
                      ? 'text-blue-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-[12px] outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-500"
                />
                <span className="text-[11px] text-gray-400">s/d</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-900 rounded-xl text-[12px] outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-orange-500"
                />
              </div>
            )}
            <div className="lg:ml-auto text-[14px] text-gray-400 dark:text-gray-500 font-mono">
              {range.from} → {range.to}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Summary
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        {/* ── Stat Cards by Category ── */}
        <div className="space-y-3">
          {/* User & AI Features */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <StatSection
              title="Users"
              icon={Users}
              color="text-blue-600 dark:text-blue-400"
              bgColor="bg-blue-50/60 dark:bg-blue-950/20"
              borderColor="border-blue-100 dark:border-blue-900/40"
            >
              <StatCard
                label="New User"
                value={totals.users ?? 0}
                subtext={`Avg ${(totals.users_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#2563eb"
              />
              <StatCard
                label="Active User"
                value={totals.active_users ?? 0}
                subtext={`Avg ${(totals.active_users_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#10b981"
              />
              <StatCard
                label="Active 7D"
                value={totals.active_users_7d ?? 0}
                subtext="Last active 7 hari"
                loading={loading}
                accent="#0f766e"
              />
              <StatCard
                label="Active 30D"
                value={totals.active_users_30d ?? 0}
                subtext="Last active 30 hari"
                loading={loading}
                accent="#0891b2"
              />
            </StatSection>

            <StatSection
              title="AI Features"
              icon={Bot}
              color="text-rose-600 dark:text-rose-400"
              bgColor="bg-rose-50/60 dark:bg-rose-950/20"
              borderColor="border-rose-100 dark:border-rose-900/40"
            >
              <StatCard
                label="Conversation"
                value={totals.conversation ?? 0}
                subtext={`Avg ${(totals.conversation_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#ff0000"
              />
              <StatCard
                label="Document"
                value={totals.document ?? 0}
                subtext={`Avg ${(totals.document_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#f59e0b"
              />
              <StatCard
                label="Paraphrase"
                value={totals.paraphrase ?? 0}
                subtext={`Avg ${(totals.paraphrase_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#10b981"
              />
              <StatCard
                label="Humanizer"
                value={totals.humanizer ?? 0}
                subtext={`Avg ${(totals.humanizer_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#3b82f6"
              />
              <StatCard
                label="Transcribe"
                value={totals.transcribe ?? 0}
                subtext={`Avg ${(totals.transcribe_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#8b5cf6"
              />
            </StatSection>
          </div>

          {/* Plagiarism & Transaction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <StatSection
              title="Plagiarism"
              icon={FileSearch}
              color="text-violet-600 dark:text-violet-400"
              bgColor="bg-violet-50/60 dark:bg-violet-950/20"
              borderColor="border-violet-100 dark:border-violet-900/40"
            >
              <StatCard
                label="Total"
                value={totals.plagiarism ?? 0}
                subtext={`Avg ${(totals.plagiarism_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#7c3aed"
              />
              <StatCard
                label="Waiting Pay"
                value={totals.plagiarism_waiting_payment ?? 0}
                subtext={`Avg ${(totals.plagiarism_waiting_payment_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#f59e0b"
              />
            </StatSection>

            <StatSection
              title="Transaksi"
              icon={CircleDollarSign}
              color="text-emerald-600 dark:text-emerald-400"
              bgColor="bg-emerald-50/60 dark:bg-emerald-950/20"
              borderColor="border-emerald-100 dark:border-emerald-900/40"
            >
              <StatCard
                label="TX Paid"
                value={totals.tx_paid ?? 0}
                subtext={`Avg ${(totals.tx_paid_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#16a34a"
              />
              <StatCard
                label="Revenue"
                value={`Rp ${formatMoney(totals.tx_revenue ?? 0)}`}
                subtext={`Avg Rp ${formatMoney(totals.tx_revenue_avg ?? 0)}/tx`}
                loading={loading}
                accent="#16a34a"
              />
            </StatSection>
          </div>

          {/* Coupon & Blog */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <StatSection
              title="Coupon"
              icon={Ticket}
              color="text-amber-600 dark:text-amber-400"
              bgColor="bg-amber-50/60 dark:bg-amber-950/20"
              borderColor="border-amber-100 dark:border-amber-900/40"
            >
              <StatCard
                label="Total"
                value={totals.coupon_redeemed_total ?? 0}
                subtext={`Avg ${(totals.coupon_redeemed_total_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#92400e"
              />
              <StatCard
                label="Regular"
                value={totals.coupon_redeemed_regular ?? 0}
                subtext={`Avg ${(totals.coupon_redeemed_regular_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#d97706"
              />
              <StatCard
                label="Campaign"
                value={totals.coupon_redeemed_campaign ?? 0}
                subtext={`Avg ${(totals.coupon_redeemed_campaign_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#f59e0b"
              />
            </StatSection>

            <StatSection
              title="Blog"
              icon={FileText}
              color="text-sky-600 dark:text-sky-400"
              bgColor="bg-sky-50/60 dark:bg-sky-950/20"
              borderColor="border-sky-100 dark:border-sky-900/40"
            >
              <StatCard
                label="Views"
                value={totals.blog_views ?? 0}
                subtext={`Avg ${(totals.blog_views_avg ?? 0).toFixed(1)}/hari`}
                loading={loading}
                accent="#0284c7"
              />
            </StatSection>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Statistics
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent" />
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* New User — Area */}
          <ChartCard title="User Activity / Day" subtitle="Registrasi dan user aktif per hari">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="active_users"
                  name="Active Users"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* AI Features — Line */}
          <ChartCard
            title="AI Features"
            subtitle="Conversation · Writer Document · Paraphrase · Humanizer · Transcribe"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="conversation"
                  name="Conversation"
                  stroke="#ff0000"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="document"
                  name="Document"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="paraphrase"
                  name="Paraphrase"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="humanizer"
                  name="Humanizer"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="transcribe"
                  name="Transcribe"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Plagiarism — Line */}
          <ChartCard title="Plagiarism Checker" subtitle="Total request + waiting payment per hari">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
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
                  name="Waiting Pay"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Transaction — Composed */}
          <ChartCard title="Transaction" subtitle="Count paid + revenue per hari" right={true}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                <YAxis yAxisId="left" allowDecimals={false} {...chartAxis} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  {...chartAxis}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip content={<TooltipBox moneyKey="tx_revenue" />} labelFormatter={(v) => v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar
                  yAxisId="left"
                  dataKey="tx_paid"
                  name="Paid"
                  fill="#2563eb"
                  fillOpacity={0.85}
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  dataKey="tx_revenue"
                  name="Revenue"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Blog Views — Area + Top Blog */}

          {/* Coupon — Bar */}
          <ChartCard title="Coupon Redemption" subtitle="Regular vs Campaign per hari">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                <YAxis allowDecimals={false} {...chartAxis} />
                <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="coupon_redeemed_regular"
                  name="Regular"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coupon_redeemed_campaign"
                  name="Campaign"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <section className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">Blog Views</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                Event views per hari
              </p>
            </div>
            <div className="h-[200px] pr-8 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradBlog" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={isDark ? 0.08 : 0.5} />
                  <XAxis dataKey="date" tickFormatter={labelDate} {...chartAxis} />
                  <YAxis allowDecimals={false} {...chartAxis} />
                  <Tooltip content={<TooltipBox />} labelFormatter={(v) => v} />
                  <Area
                    type="monotone"
                    dataKey="blog_views"
                    name="Views"
                    stroke="#0284c7"
                    strokeWidth={2}
                    fill="url(#gradBlog)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {/* Top Blogs */}
            <div className="px-5 pb-4 pt-3 border-t border-gray-50 dark:border-gray-700/40">
              <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                Top Blog
              </div>
              {topBlogs.length === 0 ? (
                <div className="text-[12px] text-gray-400 dark:text-gray-500">Belum ada data</div>
              ) : (
                <div className="space-y-1">
                  {topBlogs.map((b, i) => (
                    <a
                      key={b.id}
                      href={`${window.location.origin}/blog/${b.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg px-2 py-1.5 -mx-2 transition-colors"
                    >
                      <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 w-4 shrink-0 tabular-nums">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {b.title}
                        </div>
                      </div>
                      <span className="font-black text-sky-600 dark:text-sky-400 shrink-0">
                        {b.views}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4 text-emerald-500" />
                Devices
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                Device terakhir dari user aktif
              </p>
            </div>
            <div className="px-5 py-4">
              {deviceBreakdown.length === 0 ? (
                <div className="text-[12px] text-gray-400 dark:text-gray-500">Belum ada data</div>
              ) : (
                <div className="space-y-2.5">
                  {deviceBreakdown.map((item) => (
                    <div key={item.device} className="flex items-center gap-3 text-[12px]">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {item.device}
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min((item.users / Math.max(1, totals.active_users_30d ?? item.users)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                        {item.users}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
              <p className="text-[13px] font-bold text-gray-800 dark:text-gray-100">
                Recent Active Users
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                User aktif terbaru beserta device dan IP
              </p>
            </div>
            <div className="px-5 py-4">
              {recentActiveUsers.length === 0 ? (
                <div className="text-[12px] text-gray-400 dark:text-gray-500">Belum ada data</div>
              ) : (
                <div className="space-y-1">
                  {recentActiveUsers.map((u) => (
                    <div
                      key={u.id}
                      className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] gap-2 md:items-center text-[12px] rounded-lg px-2 py-2 -mx-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-700 dark:text-gray-200 truncate">
                          {u.name || u.email}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                          {u.email}
                        </div>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 truncate">
                        {u.device || 'Unknown'} · {u.ip || '-'}
                      </div>
                      <div className="font-mono text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {u.last_active || '-'}
                      </div>
                    </div>
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
