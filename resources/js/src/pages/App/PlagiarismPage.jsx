import {
  ChevronRight,
  CloudUpload,
  CreditCard,
  FileText,
  Info,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  XCircle,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import { useRightSidebar } from '@/context/RightSidebarContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const PRICE_PER_FILE = 22000
const ACCEPTED_TYPES = '.doc,.docx,.pdf,.txt,.rtf,.odt'
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

const SERVICES = [
  {
    id: 'turnitin',
    name: 'Turnin Check',
    desc: 'Cek plagiarisme profesional via Turnin',
    icon: Search,
  },
  {
    id: 'drillbot',
    name: 'Drillbot AI Check',
    desc: 'Deteksi konten AI menggunakan Drillbot',
    icon: Zap,
  },
]

const STATUS_CONFIG = {
  waiting_payment: {
    label: 'Menunggu Bayar',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    dot: 'bg-yellow-400',
  },
  pending: {
    label: 'Antre',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    dot: 'bg-blue-400',
  },
  processing: {
    label: 'Diproses',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    dot: 'bg-purple-400 animate-pulse',
  },
  done: {
    label: 'Selesai',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    dot: 'bg-red-400',
  },
  failed: {
    label: 'Gagal',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    dot: 'bg-red-400',
  },
}

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n)

const splitName = (name) => {
  const trimmed = (name || '').trim()
  if (!trimmed) return ['', '']
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return [parts[0], '']
  return [parts[0], parts.slice(1).join(' ')]
}

// ─── Sub-components ───────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-[28px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 animate-pulse space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-900 p-4 space-y-2">
            <div className="h-2.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-2.5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="h-11 w-36 rounded-2xl bg-gray-200 dark:bg-gray-700" />
        <div className="h-11 w-36 rounded-2xl bg-gray-100 dark:bg-gray-900" />
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function FileCard({ file, index, onRemove }) {
  const ext = file.name.split('.').pop().toUpperCase()
  const sizeKb = (file.size / 1024).toFixed(0)
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{ext}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
        <p className="text-xs text-gray-400">{sizeKb} KB</p>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-300 hover:text-red-500 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function PendingBadge({ files, tx, onCancel, isCancelling, onPayNow }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!tx?.expiredAt) return
    const tick = () => {
      const diff = tx.expiredAt * 1000 - Date.now()
      if (diff <= 0) {
        setTimeLeft('Kedaluwarsa')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${h > 0 ? h + 'j ' : ''}${m}m ${s}d`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tx?.expiredAt])

  return (
    <div className="rounded-[28px] border-2 border-amber-200 dark:border-amber-700/50 bg-amber-50/50 dark:bg-amber-900/10 p-4 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
            Pembayaran Menunggu
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Selesaikan pembayaran untuk memproses file
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Upload baru tidak bisa dilakukan sebelum pembayaran ini diselesaikan.
          </p>
        </div>
      </div>

      {/* Detail pembayaran */}
      <div className="grid gap-3 sm:grid-cols-3 overflow-auto">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1.5">Total</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(tx?.amount)}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {files.length} file × {fmt(PRICE_PER_FILE)}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1.5">Metode</p>
          <p className="font-semibold text-gray-900 dark:text-white uppercase">
            {tx?.method || '-'}
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1.5">Sisa Waktu</p>
          <p className="font-semibold text-gray-900 dark:text-white font-mono">{timeLeft}</p>
          <p className="text-xs text-gray-400 mt-0.5">sebelum kedaluwarsa</p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3 font-semibold">
            File yang akan diproses ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
              >
                <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {f.name}
                </span>
                <StatusBadge status={f.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onPayNow}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all shadow-sm shadow-amber-200 dark:shadow-amber-900/30"
        >
          <CreditCard className="w-4 h-4" />
          Bayar Sekarang
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onCancel}
          disabled={isCancelling}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
        >
          {isCancelling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Batalkan Pembayaran
        </button>
      </div>

      {/* Instructions */}
      {tx?.instructions && tx.instructions.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors list-none flex items-center gap-2">
            <Info className="w-4 h-4" />
            Lihat instruksi pembayaran
            <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
          </summary>
          <div className="mt-4 space-y-3">
            {tx.instructions.map((step, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {step.title}
                </p>
                <ol className="space-y-1">
                  {step.steps?.map((s, j) => (
                    <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                      <span className="font-semibold text-gray-400">{j + 1}.</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function PlagiarismPage() {
  const { user, me } = useAuth()
  const { open: openRightSidebar } = useRightSidebar()
  const { showSnackbar } = useSnackbar()
  const navigate = useNavigate()

  // Loading states
  const [pageLoading, setPageLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pending payment state
  const [pendingTx, setPendingTx] = useState(null)
  const [pendingFiles, setPendingFiles] = useState([])

  // Form state
  const [serviceType, setServiceType] = useState('turnitin')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [authorFirstName, setAuthorFirstName] = useState('')
  const [authorLastName, setAuthorLastName] = useState('')
  const [whatsappPhone, setWhatsappPhone] = useState(user?.phone || '')
  const [excludeBiblio, setExcludeBiblio] = useState(false)
  const [excludeQuoted, setExcludeQuoted] = useState(false)
  const [excludeCited, setExcludeCited] = useState(false)
  const [excludeSmall, setExcludeSmall] = useState(false)

  const dropRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user?.name) return
    if (authorFirstName || authorLastName) return
    const [first, last] = splitName(user.name)
    setAuthorFirstName(first)
    setAuthorLastName(last)
  }, [user?.name, authorFirstName, authorLastName])

  const addFiles = useCallback(
    (newFiles) => {
      const valid = newFiles.filter((f) => {
        const ext = f.name.split('.').pop().toLowerCase()
        if (!['doc', 'docx', 'pdf', 'txt', 'rtf', 'odt'].includes(ext)) {
          showSnackbar('error', `${f.name}: format tidak didukung`)
          return false
        }
        if (f.size > MAX_FILE_SIZE) {
          showSnackbar('error', `${f.name}: ukuran melebihi 50MB`)
          return false
        }
        return true
      })
      setSelectedFiles((prev) => {
        const combined = [...prev, ...valid]
        if (combined.length > 3) {
          showSnackbar('error', 'Maksimal 3 file per batch')
          return combined.slice(0, 3)
        }
        return combined
      })
    },
    [showSnackbar],
  )

  // ── Init: cek pending payment ─────────────────────────────
  useEffect(() => {
    checkPending()
  }, [])

  const checkPending = async () => {
    setPageLoading(true)
    try {
      const res = await request('/plagiarism/pending-payment')
      if (res.has_pending) {
        setPendingTx(res.transaction)
        setPendingFiles(res.files || [])
      } else {
        setPendingTx(null)
        setPendingFiles([])
      }
    } catch {
      // ignore
    } finally {
      setPageLoading(false)
    }
  }

  // ── Drag & Drop ───────────────────────────────────────────
  useEffect(() => {
    const el = dropRef.current
    if (!el) return
    const prevent = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
    const onDrop = (e) => {
      prevent(e)
      addFiles([...e.dataTransfer.files])
    }
    el.addEventListener('dragover', prevent)
    el.addEventListener('drop', onDrop)
    return () => {
      el.removeEventListener('dragover', prevent)
      el.removeEventListener('drop', onDrop)
    }
  }, [selectedFiles, addFiles])

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // ── Validasi form ─────────────────────────────────────────
  const validateForm = () => {
    if (selectedFiles.length === 0) {
      showSnackbar('error', 'Pilih minimal 1 file')
      return false
    }
    if (!authorFirstName.trim() || !authorLastName.trim()) {
      showSnackbar('error', 'Nama penulis harus diisi')
      return false
    }
    if (!whatsappPhone.trim()) {
      showSnackbar('error', 'Nomor WhatsApp harus diisi')
      return false
    }
    return true
  }

  // ── Navigate ke CheckoutPage dengan state plagiarism ──────
  const handleProceedToCheckout = () => {
    if (!validateForm()) return

    if (shouldUseQuotaDirectly) {
      handleSubmitWithQuota()
      return
    }

    navigate('/checkout', {
      state: {
        isPlagiarism: true,
        plagiarismData: {
          files: selectedFiles,
          serviceType,
          authorFirstName: authorFirstName.trim(),
          authorLastName: authorLastName.trim(),
          whatsappPhone: whatsappPhone.trim(),
          excludeBiblio,
          excludeQuoted,
          excludeCited,
          excludeSmall,
        },
        // Data plan-like untuk ditampilkan di checkout summary
        plan: {
          id: 'plagiarism',
          name: 'Plagiarism Check',
          tagLine: selectedFiles.length + ' file dokumen',
          selectedPeriodSuffix: SERVICES.find((s) => s.id === serviceType)?.name ?? serviceType,
          selectedPrice: totalAmount,
          itemName: `Plagiarism Check - ${selectedFiles.length} file`,
          quotaUsed,
        },
        returnUrl: '/plagiarism',
      },
    })
  }

  // ── Navigate ke PaymentPage untuk pending ────────────────
  const handlePayNow = () => {
    if (!pendingTx?.referenceId) return
    navigate('/payment', {
      state: {
        referenceId: pendingTx.referenceId,
        paymentCode: pendingTx.paymentCode,
        payUrl: null,
        checkoutUrl: pendingTx.checkoutUrl,
        expiredAt: pendingTx.expiredAt,
        instructions: pendingTx.instructions ?? [],
        plan: { name: 'Plagiarism Check' },
        price: pendingTx.amount,
        selectedMethod: pendingTx.channel,
        transactionType: 'plagiarism',
        returnUrl: '/plagiarism',
      },
    })
  }

  const handleCancel = async () => {
    if (!confirm('Yakin ingin membatalkan pembayaran ini?')) return
    setIsCancelling(true)
    try {
      await request('/plagiarism/cancel-payment', { method: 'POST' })
      setPendingTx(null)
      setPendingFiles([])
      showSnackbar('success', 'Pembayaran dibatalkan')
    } catch (err) {
      showSnackbar('error', err?.message || 'Gagal membatalkan')
    } finally {
      setIsCancelling(false)
    }
  }

  const availableQuota = user?.quota ?? 0
  const quotaUsed = Math.min(availableQuota, selectedFiles.length)
  const remainingFiles = selectedFiles.length - quotaUsed
  const totalAmount = remainingFiles * PRICE_PER_FILE
  const shouldUseQuotaDirectly = selectedFiles.length > 0 && remainingFiles === 0

  const handleSubmitWithQuota = async () => {
    if (!validateForm()) return

    const fd = new FormData()
    selectedFiles.forEach((file) => fd.append('documents[]', file))
    fd.append('service_type', serviceType)
    fd.append('author_first_name', authorFirstName.trim())
    fd.append('author_last_name', authorLastName.trim())
    fd.append('whatsapp_phone', whatsappPhone.trim())
    fd.append('channel', 'quota')
    fd.append('method', 'quota')
    fd.append('phone', whatsappPhone.trim() || user?.phone || '')
    if (excludeBiblio) fd.append('exclude_bibliography', 'true')
    if (excludeQuoted) fd.append('exclude_quoted_text', 'true')
    if (excludeCited) fd.append('exclude_cited_text', 'true')
    if (excludeSmall) fd.append('exclude_small_matches', 'true')

    setIsSubmitting(true)
    try {
      await request('/plagiarism', { method: 'POST', body: fd })
      setSelectedFiles([])
      await checkPending()
      if (me) await me()
      showSnackbar('success', 'File berhasil dikirim menggunakan kuota')
    } catch (err) {
      showSnackbar('error', err?.message || 'Gagal mengirim dengan kuota')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] p-5 md:p-10 transition-colors duration-300">
      <div className="mt-14 md:mt-0 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[28px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-8 py-7">
          <div className="flex flex-col gap-3 text-center md:text-start sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-orange-400 mb-2">
                Plagiarism Checker
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                Cek dokumen, bayar, dan pantau hasilnya
              </h1>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={openRightSidebar}
                className="mt-2 md:mt-0 ml-auto mr-auto md:mr-0 md:ml-auto inline-flex items-center rounded-full border border-blue-500 bg-blue-50 dark:border-orange-500 dark:bg-orange-500/10 shadow-sm px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 dark:text-orange-400 dark:hover:bg-orange-500/20"
              >
                Pantau Hasil
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                Dokumen aman & terenkripsi
              </div>
            </div>
          </div>
        </div>

        {/* ── Skeleton loading ────────────────────────────── */}
        {pageLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
          </div>
        ) : pendingTx ? (
          /* ── Pending payment ────────────────────────────── */
          <PendingBadge
            files={pendingFiles}
            tx={pendingTx}
            onCancel={handleCancel}
            isCancelling={isCancelling}
            onPayNow={handlePayNow}
          />
        ) : (
          /* ── Upload form ────────────────────────────────── */
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* Left: Form */}
            <div className="space-y-5">
              <div className="rounded-[28px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 space-y-7">
                {/* Service selector */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Pilih Layanan
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setServiceType(s.id)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          serviceType === s.id
                            ? 'border-blue-500 bg-blue-50 dark:border-orange-500 dark:bg-orange-500/10 shadow-sm'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <s.icon className="w-6 h-6 text-blue-600 dark:text-orange-400" />
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {s.desc}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drop zone */}
                <div>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Upload Dokumen
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Maksimal 3 file, masing-masing hingga 50MB
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 transition-all">
                    <div
                      ref={dropRef}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative cursor-pointer rounded-[28px] border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-orange-500 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50/30 dark:hover:bg-orange-500/5 transition-all p-8 flex flex-col items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-orange-900/20 flex items-center justify-center">
                        <CloudUpload className="w-6 h-6 text-blue-600 dark:text-orange-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Drag & drop atau klik untuk pilih file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">.doc .docx .pdf .txt .rtf .odt</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {selectedFiles.length}/3 file dipilih
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPTED_TYPES}
                        className="hidden"
                        onChange={(e) => addFiles([...e.target.files])}
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="mt-5 space-y-3">
                        {selectedFiles.map((f, i) => (
                          <FileCard key={i} file={f} index={i} onRemove={removeFile} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Author data */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Data Penulis
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Nama depan
                      </label>
                      <input
                        value={authorFirstName}
                        onChange={(e) => setAuthorFirstName(e.target.value)}
                        placeholder="Budi"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-orange-500 transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Nama belakang
                      </label>
                      <input
                        value={authorLastName}
                        onChange={(e) => setAuthorLastName(e.target.value)}
                        placeholder="Santoso"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-orange-500 transition"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                        Nomor WhatsApp
                      </label>
                      <input
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        placeholder="6281234567890"
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 dark:focus:border-orange-500 transition"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Wajib diisi untuk notifikasi hasil check via WhatsApp
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exclusion options */}
                <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-5">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Pengaturan Pengecualian
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      {
                        key: 'biblio',
                        label: 'Kecualikan bibliografi',
                        val: excludeBiblio,
                        set: setExcludeBiblio,
                      },
                      {
                        key: 'quoted',
                        label: 'Kecualikan teks kutipan',
                        val: excludeQuoted,
                        set: setExcludeQuoted,
                      },
                      {
                        key: 'cited',
                        label: 'Kecualikan teks yang disitir',
                        val: excludeCited,
                        set: setExcludeCited,
                      },
                      {
                        key: 'small',
                        label: 'Kecualikan small matches',
                        val: excludeSmall,
                        set: setExcludeSmall,
                      },
                    ].map((opt) => (
                      <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${opt.val ? 'bg-blue-600 border-blue-600 dark:bg-orange-500 dark:border-orange-500' : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'}`}
                        >
                          {opt.val && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                              <path
                                d="M9 1L3.5 7 1 4.5"
                                stroke="white"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={opt.val}
                          onChange={(e) => opt.set(e.target.checked)}
                          className="hidden"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-400 px-8 py-3.5 text-sm font-semibold text-white transition-all shadow-sm shadow-blue-200 dark:shadow-orange-900/30 disabled:opacity-60"
                >
                  {shouldUseQuotaDirectly ? (
                    isSubmitting ? (
                      'Mengirim...'
                    ) : (
                      'Gunakan Kuota & Submit'
                    )
                  ) : (
                    <>
                      Lanjut ke Pembayaran
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Summary */}
            <aside className="rounded-[28px] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 space-y-5 h-fit sticky top-6">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-800 dark:text-gray-200">
                <Shield className="w-4 h-4 text-blue-600 dark:text-orange-400" />
                Ringkasan Order
              </div>

              {availableQuota > 0 && (
                <div className="rounded-2xl border border-blue-100 dark:border-orange-700/60 bg-blue-50 dark:bg-orange-950/20 p-4 text-sm text-blue-700 dark:text-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">Kuota tersedia</span>
                    <span>{availableQuota} file</span>
                  </div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-300 text-sm">
                    {selectedFiles.length > 0 ? (
                      <>
                        <p>Dipakai: {quotaUsed} file</p>
                        <p>
                          {remainingFiles > 0
                            ? `Bayar sisa ${remainingFiles} file (${fmt(totalAmount)})`
                            : 'Semua file akan diproses dengan kuota'}
                        </p>
                      </>
                    ) : (
                      <p>Pilih file untuk melihat berapa kuota yang akan dipakai.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Layanan</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {SERVICES.find((s) => s.id === serviceType)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Jumlah file</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedFiles.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Harga/file</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {fmt(PRICE_PER_FILE)}
                  </span>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-800" />
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Total</span>
                  <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                    {fmt(totalAmount)}
                  </span>
                </div>
              </div>

              {selectedFiles.length === 0 && (
                <div className="text-center py-4">
                  <CloudUpload className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">Belum ada file dipilih</p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
