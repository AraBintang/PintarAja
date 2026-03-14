import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Monitor,
  Moon,
  RefreshCw,
  SquareArrowOutUpRight,
  Sun,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTheme } from '@/context/ThemeContext'
import { request } from '@/utils/Http'

/* ─── constants ──────────────────────────────────────────────────────────── */

const AUTO_REFRESH_MS = 15_000
const COOLDOWN_SEC = 10

function formatPrice(n) {
  return new Intl.NumberFormat('id-ID').format(n)
}

function formatExpiry(unix) {
  if (!unix) return null
  return new Date(unix * 1000).toLocaleString('en-UK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/* ─── smooth accordion ───────────────────────────────────────────────────── */

function AccordionItem({ title, steps, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  // Ukur height konten setiap isOpen atau steps berubah
  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen, steps])

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left
          hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors"
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Animated container */}
      <div
        style={{
          height,
          overflow: 'hidden',
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div ref={contentRef} className="px-5 pb-5 space-y-3">
          {steps.map((step, sIdx) => (
            <div key={sIdx} className="flex gap-3">
              <div
                className="w-5 h-5 rounded-full border bg-blue-50 text-[#2686D4] dark:text-[#F2901E] border-blue-200 dark:border-orange-500/30 dark:bg-orange-500/10 font-bold flex items-center justify-center
                text-[10px] shrink-0 mt-0.5"
              >
                {sIdx + 1}
              </div>
              <p
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: step }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── status config ──────────────────────────────────────────────────────── */

const STATUS_CFG = {
  0: {
    label: 'Waiting to pay',
    Icon: Clock,
    wrap: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40',
    icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
  },
  1: {
    label: 'Paid',
    Icon: CheckCircle2,
    wrap: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  2: {
    label: 'Refunded',
    Icon: RefreshCw,
    wrap: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-500',
    text: 'text-blue-700 dark:text-blue-400',
  },
  3: {
    label: 'Expired',
    Icon: XCircle,
    wrap: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40',
    icon: 'bg-red-100 dark:bg-red-900/50 text-red-500',
    text: 'text-red-700 dark:text-red-400',
  },
}

const ALL_METHODS = [
  { id: 'qris', name: 'QRIS' },
  { id: 'ovo', name: 'OVO' },
  { id: 'dana', name: 'DANA' },
  { id: 'shopeepay', name: 'ShopeePay' },
  { id: 'bri_va', name: 'BRI VA' },
  { id: 'bni_va', name: 'BNI VA' },
  { id: 'mandiri_va', name: 'Mandiri VA' },
  { id: 'bca_va', name: 'BCA VA' },
  { id: 'alfamart', name: 'Alfamart' },
  { id: 'indomaret', name: 'Indomaret' },
]

/* ─── main component ─────────────────────────────────────────────────────── */

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()
  const { theme, toggleTheme } = useTheme()

  const state = location.state ?? {}
  const isFromHistory = state.fromHistory ?? false
  // returnUrl: halaman yang membuka detail ini (dipakai tombol Kembali)
  const returnUrl = state.returnUrl ?? null

  const seedData =
    !isFromHistory && state.referenceId
      ? {
          referenceId: state.referenceId,
          paymentCode: state.paymentCode,
          payUrl: state.payUrl,
          checkoutUrl: state.checkoutUrl,
          expiredAt: state.expiredAt,
          instructions: state.instructions ?? [],
          plan: state.plan,
          price: state.price,
          selectedMethod: state.selectedMethod,
          statusCode: 0,
        }
      : null

  const [txData, setTxData] = useState(seedData)
  const [loading, setLoading] = useState(isFromHistory)
  const [fetching, setFetching] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  // accordion: index yang sedang terbuka (-1 = semua tutup)
  const [openGroup, setOpenGroup] = useState(0)

  const cooldownRef = useRef(null)
  const autoRef = useRef(null)
  const referenceId = state.referenceId

  /* ─── fetch detail ─── */
  const fetchDetail = useCallback(
    async (showSpinner = true) => {
      if (!referenceId) return
      if (showSpinner) setFetching(true)
      try {
        const res = await request(`/payments/${referenceId}`)
        setTxData((prev) => ({
          payUrl: prev?.payUrl ?? prev?.paymentCode ?? null,
          checkoutUrl: res.checkoutUrl ?? prev?.checkoutUrl ?? null,
          instructions: res.instructions?.length ? res.instructions : (prev?.instructions ?? []),
          plan: prev?.plan ?? { name: res.planName },
          referenceId: res.referenceId,
          paymentCode: res.paymentCode,
          expiredAt: res.expiredAt,
          price: res.amount,
          selectedMethod: res.method,
          statusCode: res.statusCode,
        }))
      } catch {
        showSnackbar('error', 'Gagal memuat data transaksi')
      } finally {
        setFetching(false)
        setLoading(false)
      }
    },
    [referenceId, showSnackbar],
  )

  /* ─── initial load ─── */
  useEffect(() => {
    if (isFromHistory) fetchDetail(false)
  }, [isFromHistory, fetchDetail])

  /* ─── auto-refresh setiap 15 detik, stop kalau bukan pending ─── */
  useEffect(() => {
    if (!referenceId) return
    autoRef.current = setInterval(() => {
      setTxData((prev) => {
        if (prev && prev.statusCode !== 0) {
          clearInterval(autoRef.current)
          return prev
        }
        return prev
      })
      fetchDetail(false)
    }, AUTO_REFRESH_MS)
    return () => clearInterval(autoRef.current)
  }, [referenceId, fetchDetail])

  /* ─── cooldown ticker ─── */
  const startCooldown = () => {
    setCooldown(COOLDOWN_SEC)
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current)
          return 0
        }
        return c - 1
      })
    }, 1_000)
  }

  useEffect(
    () => () => {
      clearInterval(cooldownRef.current)
      clearInterval(autoRef.current)
    },
    [],
  )

  const handleManualRefresh = () => {
    if (cooldown > 0 || fetching) return
    fetchDetail(true)
    startCooldown()
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text?.replace(/\s/g, '') ?? '')
    showSnackbar('success', 'Disalin ke clipboard')
  }

  /* ─── navigasi balik ke history ─── */
  const handleBack = () => {
    if (isFromHistory && returnUrl) {
      // Kembali ke halaman asal (mis. /chat) sambil buka settings di tab history
      navigate(`${returnUrl}?settings=true&tab=history`)
    } else {
      navigate('/chat', { replace: true })
    }
  }

  /* ─── loading ─── */
  if (loading || !txData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] dark:bg-[#0c0f1a]">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  const {
    statusCode,
    paymentCode,
    payUrl,
    checkoutUrl,
    instructions,
    plan,
    price,
    selectedMethod,
    expiredAt,
  } = txData
  const cfg = STATUS_CFG[statusCode] ?? STATUS_CFG[0]
  const { Icon: StatusIcon } = cfg
  const methodName = ALL_METHODS.find((m) => m.id === selectedMethod)?.name ?? selectedMethod
  const isPending = statusCode === 0
  const isQris = selectedMethod === 'qris'
  const isEwallet = ['ovo', 'dana', 'shopeepay'].includes(selectedMethod)

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden
      bg-[#f0f4ff] dark:bg-[#0c0f1a]"
    >
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full
          bg-blue-200/50 dark:bg-blue-900/20 blur-[110px]"
        />
        <div
          className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full
          bg-violet-200/40 dark:bg-violet-900/15 blur-[100px]"
        />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(to right, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div
        className="sticky top-0 z-10 px-6 py-3.5 shrink-0
        bg-white/60 dark:bg-gray-950/60 backdrop-blur-xl
        border-b border-gray-200/60 dark:border-gray-800/60"
      >
        <div className="max-w-2xl px-6 mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Order detail</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{referenceId}</p>
            </div>
          </div>

          <div className="flex gap-3">
            {isPending && (
              <button
                onClick={handleManualRefresh}
                disabled={cooldown > 0 || fetching}
                title="Refresh status pembayaran"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700
          text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
          transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
                {cooldown > 0 ? `${cooldown}s` : 'Refresh'}
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="z-50 w-9 h-9 flex items-center justify-center rounded-xl
          bg-white/70 dark:bg-gray-800/70 backdrop-blur border border-gray-200 dark:border-gray-700
          text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
          transition-all shadow-sm"
            >
              {theme === 'light' && <Sun size={15} />}
              {theme === 'dark' && <Moon size={15} />}
              {theme === 'system' && <Monitor size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto relative z-[1]">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
          {isPending && (
            <p className="text-center text-[11px] text-gray-400 dark:text-gray-600">
              Status is updated automatically every {AUTO_REFRESH_MS / 1000} seconds
            </p>
          )}

          {/* Status Banner */}
          <div
            className={`rounded-2xl border p-5 flex items-center gap-4 backdrop-blur-sm ${cfg.wrap}`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.icon}`}
            >
              <StatusIcon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${cfg.text}`}>{cfg.label}</p>
              {isPending && expiredAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Deadline: <span className="font-semibold">{formatExpiry(expiredAt)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Payment Action Area */}
          {isPending && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5 space-y-5">
              {/* QRIS */}
              {isQris && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      {paymentCode ? (
                        <img src={paymentCode} alt="QR Code" className="w-44 h-44 object-contain" />
                      ) : (
                        <div className="w-44 h-44 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
                          QR tidak tersedia
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Scan dari aplikasi e-wallet atau m-banking yang mendukung QRIS
                    </p>
                  </div>
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                        bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800
                        text-sm font-semibold text-gray-600 dark:text-gray-300
                        flex items-center justify-center gap-2 transition-all"
                    >
                      <SquareArrowOutUpRight className="w-4 h-4" />
                      Lakukan pembayaran di Tripay
                    </a>
                  )}
                </div>
              )}

              {/* E-Wallet */}
              {isEwallet && (
                <div className="space-y-3">
                  {payUrl && (
                    <a
                      href={payUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-blue-600 dark:bg-orange-500 text-white
                        font-bold text-sm flex items-center justify-center gap-2
                        hover:bg-blue-700 dark:hover:bg-orange-600 transition-all shadow-md"
                    >
                      Lanjutkan Pembayaran via {methodName}
                      <SquareArrowOutUpRight className="w-4 h-4" />
                    </a>
                  )}
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                        bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800
                        text-sm font-semibold text-gray-600 dark:text-gray-300
                        flex items-center justify-center gap-2 transition-all"
                    >
                      <SquareArrowOutUpRight className="w-4 h-4" />
                      Lakukan pembayaran di Tripay
                    </a>
                  )}
                </div>
              )}

              {/* VA & Minimarket */}
              {!isQris && !isEwallet && paymentCode && (
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Kode Pembayaran
                    </p>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700">
                      <span className="flex-1 text-xl font-mono font-bold tracking-widest text-gray-900 dark:text-white break-all">
                        {paymentCode}
                      </span>
                      <button
                        onClick={() => handleCopy(paymentCode)}
                        className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-orange-400 transition-colors shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {checkoutUrl && (
                    <a
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                        bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800
                        text-sm font-semibold text-gray-600 dark:text-gray-300
                        flex items-center justify-center gap-2 transition-all"
                    >
                      <SquareArrowOutUpRight className="w-4 h-4" />
                      Lakukan pembayaran di Tripay
                    </a>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total pay</span>
                <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                  Rp {formatPrice(price)}
                </span>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              Order Detail
            </h3>
            <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
              {[
                { label: 'Order ID', value: referenceId, mono: true },
                { label: 'Plan', value: plan?.name },
                { label: 'Method', value: methodName, upper: true },
                { label: 'Total', value: `Rp ${formatPrice(price)}`, bold: true },
                user?.email ? { label: 'Email', value: user.email } : null,
              ]
                .filter(Boolean)
                .map(({ label, value, mono, upper, bold }) => (
                  <div key={label} className="flex justify-between items-center py-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                    <span
                      className={`text-xs font-semibold text-gray-900 dark:text-white text-right max-w-[60%] break-all
                      ${mono ? 'font-mono' : ''} ${upper ? 'uppercase' : ''} ${bold ? 'text-sm font-bold' : ''}`}
                    >
                      {value ?? '-'}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Instructions Accordion — hanya pending */}
          {isPending && instructions && instructions.length > 0 && (
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-800 overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Pay Intruction
                </p>
              </div>

              {instructions.map((group, gIdx) => (
                <AccordionItem
                  key={gIdx}
                  title={group.title}
                  steps={group.steps}
                  isOpen={openGroup === gIdx}
                  onToggle={() => setOpenGroup(openGroup === gIdx ? -1 : gIdx)}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleBack}
              className="flex-1 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900
                font-bold text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              {isFromHistory ? 'Back to History' : 'Back to Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
