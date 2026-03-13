import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Copy,
  CreditCard,
  Download,
  Receipt,
  ShieldCheck,
  Store,
  Wallet,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import PlanSelectionModal from '@/components/plan/PlanSelectionModal'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

/* ─── Payment method config ─── */
const PAYMENT_METHODS = [
  {
    category: 'QRIS',
    icon: <CreditCard className="w-4 h-4" />,
    methods: [
      { id: 'qris', name: 'QRIS', image: '/assets/images/qris.png' },
    ],
  },
  {
    category: 'E-WALLET',
    icon: <Wallet className="w-4 h-4" />,
    methods: [
      { id: 'ovo', name: 'OVO', image: '/assets/images/ovo.png' },
      { id: 'dana', name: 'DANA', image: '/assets/images/dana.png' },
      { id: 'shopeepay', name: 'ShopeePay', image: '/assets/images/shopeepay.png' },
    ],
  },
  {
    category: 'VIRTUAL ACCOUNT',
    icon: <CreditCard className="w-4 h-4" />,
    methods: [
      { id: 'bri_va', name: 'BRI VA', image: '/assets/images/bri.png' },
      { id: 'bni_va', name: 'BNI VA', image: '/assets/images/bni.png' },
      { id: 'mandiri_va', name: 'Mandiri VA', image: '/assets/images/mandiri.png' },
      { id: 'bca_va', name: 'BCA VA', image: '/assets/images/bca.png' },
    ],
  },
  {
    category: 'CONVENIENCE STORE',
    icon: <Store className="w-4 h-4" />,
    methods: [
      { id: 'alfamart', name: 'Alfamart', image: '/assets/images/alfamart.png' },
      { id: 'indomaret', name: 'Indomaret', image: '/assets/images/indomaret.png' },
    ],
  },
]

/* ─── Helper Components ─── */
function StepItem({ number, text }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold items-center justify-center text-xs border border-blue-200 dark:border-blue-800 shadow-sm mt-0.5 group-hover:bg-blue-500 group-hover:text-white dark:group-hover:bg-blue-500 transition-colors">
        {number}
      </div>
      <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
        {text}
      </div>
    </div>
  )
}

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()

  const [step, setStep] = useState('checkout') // 'checkout' | 'confirmation'
  const [transactionId, setTransactionId] = useState('')
  const [paymentCode, setPaymentCode] = useState('')
  
  const [plan, setPlan] = useState(location.state?.plan ?? null)
  const [phone, setPhone] = useState('')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [changePlanOpen, setChangePlanOpen] = useState(false)
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

  // Redirect if no plan selected
  useEffect(() => {
    if (!plan && step === 'checkout') {
      navigate('/', { replace: true })
    }
  }, [plan, navigate, step])

  if (!plan) return null

  const price = plan.price?.discounted > 0 ? plan.price.discounted : plan.price?.monthly ?? 0

  const handleProceed = () => {
    if (!phone.trim()) {
      showSnackbar('error', 'Masukkan nomor telepon')
      return
    }
    if (!selectedMethod) {
      showSnackbar('error', 'Pilih metode pembayaran')
      return
    }

    // Generate dummy transaction processing details
    const methodObj = PAYMENT_METHODS.flatMap(g => g.methods).find(m => m.id === selectedMethod)
    const txId = `INV-${Math.floor(Date.now() / 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`
    
    // Generate dummy code based on method
    let code = ''
    if (selectedMethod === 'qris') {
      code = 'QRIS_READY'
    } else if (selectedMethod.includes('va')) {
      code = `8820 ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)} ${Math.floor(Math.random() * 9000 + 1000)}`
    } else {
      code = `PAY-${Math.floor(Math.random() * 900000 + 100000)}`
    }

    setTransactionId(txId)
    setPaymentCode(code)
    setStep('confirmation')
    showSnackbar('success', 'Pesanan berhasil dibuat')
  }



  const handleChangePlan = (newPlan) => {
    setPlan(newPlan)
    setChangePlanOpen(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(paymentCode.replace(/\s/g, ''))
    showSnackbar('success', 'Kode pembayaran disalin ke clipboard')
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-transparent">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              if (step === 'confirmation') setStep('checkout')
              else {
                const returnUrl = location.state?.returnUrl || '/chat'
                navigate(`${returnUrl}?settings=true&tab=subscription&openPlans=true`)
              }
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {step === 'checkout' ? 'Pembayaran' : 'Detail Pesanan'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {step === 'checkout' 
                ? 'Pilih metode pembayaran yang Anda inginkan' 
                : 'Selesaikan pembayaran Anda segera'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {step === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ═══ LEFT: Payment Methods ═══ */}
            <div className="lg:col-span-3 space-y-6">
              {PAYMENT_METHODS.map((group) => (
                <div key={group.category}>
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    {group.icon}
                    {group.category}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {group.methods.map((method) => {
                      const isActive = selectedMethod === method.id

                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`relative flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 transition-all hover:shadow-md active:scale-95 min-w-[140px] ${
                            isActive
                              ? 'border-blue-500 dark:border-orange-500 bg-blue-50 dark:bg-orange-900/10 shadow-md shadow-blue-100 dark:shadow-orange-900/20'
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          {/* Logo image */}
                          <div className="w-12 h-8 rounded shrink-0 flex items-center justify-center bg-white p-1 shadow-sm">
                            <img 
                              src={method.image} 
                              alt={method.name} 
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {method.name}
                          </span>

                          {/* Selected indicator */}
                          {isActive && (
                            <CheckCircle2 className="w-4 h-4 text-blue-500 dark:text-orange-400 absolute top-2 right-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* ═══ RIGHT: Order Summary ═══ */}
            <div className="lg:col-span-2 space-y-6">
              {/* Billing Details */}
              <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500 dark:text-orange-400" />
                  Billing Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Email Address
                    </label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                      {user?.email ?? '-'}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Nama
                    </label>
                    <div className="px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                      {user?.name ?? '-'}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-200 dark:focus:ring-orange-900/30 focus:border-blue-400 dark:focus:border-orange-400 outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Plan Summary Card */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Plan header card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 text-gray-900 border-b border-gray-200 dark:border-gray-700 dark:text-white">
                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-1">{plan.tagLine || 'A simple start for everyone'}</p>
                  <div className="flex items-end gap-1 mb-4">
                    <span className="text-3xl font-extrabold text-[#4A90D9] dark:text-white">
                      Rp {formatPrice(price)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mb-1">/ bulan</span>
                  </div>

                  <button
                    onClick={() => setChangePlanOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-[#4A90D9] dark:text-orange-400 font-bold text-sm transition-all border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none"
                  >
                    Change Plan
                  </button>
                </div>

                {/* Price breakdown */}
                <div className="bg-white dark:bg-gray-800/60 p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {plan.name} — Monthly
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      Rp. {formatPrice(price)}
                    </span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-700" />

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-extrabold text-gray-900 dark:text-white">
                      Rp {formatPrice(price)}
                    </span>
                  </div>

                  {/* Proceed button */}
                  <button
                    onClick={handleProceed}
                    className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 mt-2"
                  >
                    Proceed With Payment
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Disclaimer */}
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed text-center mt-3">
                    By continuing, you accept to our Terms of Services and Privacy Policy. Please note that payments are non-refundable.
                  </p>
                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Pembayaran Aman & Terenkripsi</span>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CONFIRMATION / DETAIL PESANAN ═══ */}
        {step === 'confirmation' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800/80 rounded-[32px] shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* Header Status */}
              <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-100 dark:border-orange-900/50 p-6 md:p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 text-orange-500 rounded-full flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Menunggu Pembayaran
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                  Silakan selesaikan pembayaran Anda sebelum batas waktu berakhir agar pesanan dapat segera diproses.
                </p>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Amount & Code Section */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                  <div className="text-center md:text-left">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                      Total Pembayaran
                    </p>
                    <p className="text-3xl font-extrabold text-[#4A90D9] dark:text-orange-400">
                      Rp {formatPrice(price)}
                    </p>
                  </div>

                  <div className="h-px w-full md:w-px md:h-16 bg-gray-200 dark:bg-gray-700" />

                  <div className="text-center md:text-left w-full md:w-auto">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
                      {selectedMethod === 'qris' ? 'Scan & Pay' : 'Kode Pembayaran / VA'}
                    </p>
                    
                    {selectedMethod === 'qris' ? (
                      <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 inline-block">
                          {/* Dummy QR Code UI */}
                          <div className="w-32 h-32 bg-gray-100 flex flex-wrap gap-1 p-1 rounded-lg relative overflow-hidden">
                            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-1 opacity-50">
                               {[...Array(16)].map((_, i) => (
                                 <div key={i} className={`bg-gray-800 rounded-sm ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                               ))}
                            </div>
                            <div className="absolute inset-4 bg-white flex items-center justify-center rounded shadow">
                              <span className="text-xs font-bold text-gray-400">QRIS</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                           Simpan gambar atau scan secara langsung
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between md:justify-start gap-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm w-full">
                        <span className="text-xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
                          {paymentCode}
                        </span>
                        <button 
                          onClick={handleCopyCode}
                          className="p-2 text-gray-400 hover:text-[#4A90D9] transition-colors"
                          title="Salin Kode"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                    <ClipboardList className="w-4 h-4 text-blue-500 dark:text-orange-400" />
                    Detail Transaksi
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Order ID</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white font-mono">{transactionId}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Paket Layanan</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{plan.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Metode Pembayaran</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                        {PAYMENT_METHODS.flatMap(g => g.methods).find(m => m.id === selectedMethod)?.name || selectedMethod}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Email Pemesan</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{user?.email || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* OVO/E-Wallet Instructions Design Enhanced */}
                <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setIsInstructionsOpen(!isInstructionsOpen)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#4A90D9] dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        Langkah Pembayaran
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        isInstructionsOpen ? 'rotate-180 text-[#4A90D9]' : ''
                      }`}
                    />
                  </button>
                  
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isInstructionsOpen
                        ? 'max-h-[800px] opacity-100 border-t border-gray-100 dark:border-gray-700'
                        : 'max-h-0 opacity-0 overflow-hidden'
                    }`}
                  >
                    <div className="p-5 md:p-6 bg-gray-50/50 dark:bg-gray-900/20">
                      <div className="space-y-4">
                        {selectedMethod === 'qris' ? (
                          <>
                            <StepItem number="1" text="Buka aplikasi m-banking atau e-wallet (OVO, GoPay, Dana, dll) di smartphone Anda." />
                            <StepItem number="2" text={<>Pilih menu <strong>Scan QRIS</strong> pada halaman utama aplikasi.</>} />
                            <StepItem number="3" text="Arahkan kamera ke QR Code di atas, atau pilih ikon galeri untuk mengunggah screenshot QR Code." />
                            <StepItem number="4" text={<>Pastikan nama merchant penerima dan total nominal <strong>Rp {formatPrice(price)}</strong> sudah sesuai.</>} />
                            <StepItem number="5" text="Klik Konfirmasi/Bayar dan masukkan PIN aplikasi Anda untuk menyelesaikan transaksi." />
                          </>
                        ) : selectedMethod?.includes('va') ? (
                          <>
                            <StepItem number="1" text="Buka aplikasi Mobile Banking, Internet Banking, atau kunjungi ATM terdekat sesuai bank yang dipilih." />
                            <StepItem number="2" text={<>Pilih menu Pembayaran, lalu pilih <strong>Transfer ke Virtual Account (VA)</strong>.</>} />
                            <StepItem number="3" text={<>Masukkan nomor VA Anda: <strong className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">{paymentCode}</strong></>} />
                            <StepItem number="4" text={<>Pastikan nama pelanggan adalah <strong>{user?.name || 'Pintaraja Customer'}</strong> dengan nominal tagihan tepat <strong>Rp {formatPrice(price)}</strong>.</>} />
                            <StepItem number="5" text="Masukkan PIN/Password untuk mengonfirmasi pembayaran." />
                          </>
                        ) : selectedMethod === 'alfamart' || selectedMethod === 'indomaret' ? (
                          <>
                            <StepItem number="1" text={<>Kunjungi gerai <strong>{selectedMethod === 'alfamart' ? 'Alfamart / Alfamidi' : 'Indomaret'}</strong> terdekat sebelum batas waktu berakhir.</>} />
                            <StepItem number="2" text={<>Sampaikan kepada kasir bahwa Anda ingin melakukan pembayaran merchant <strong>Pintaraja</strong> via {selectedMethod === 'alfamart' ? 'Alfamart' : 'Indomaret'}.</>} />
                            <StepItem number="3" text={<>Tunjukkan detail kode pembayaran Anda: <strong className="text-xl inline-block mt-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-3 py-1 rounded border border-gray-200 dark:border-gray-700 tracking-wider shadow-sm">{paymentCode}</strong></>} />
                            <StepItem number="4" text={<>Lakukan pembayaran tunai atau non-tunai sebesar <strong>Rp {formatPrice(price)}</strong> sesuai tagihan (kasir mungkin membebankan biaya admin tambahan).</>} />
                            <StepItem number="5" text="Simpan struk pembayaran fisik yang diberikan kasir sebagai bukti transaksi yang sah." />
                          </>
                        ) : (
                          <>
                            <StepItem number="1" text={<>Buka aplikasi <strong>{PAYMENT_METHODS.flatMap(g => g.methods).find(m => m.id === selectedMethod)?.name || 'E-Wallet'}</strong> di smartphone Anda.</>} />
                            <StepItem number="2" text="Pilih ikon notifikasi (lonceng) atau cek halaman utama aplikasi untuk mencari tagihan masuk dari Pintaraja." />
                            <StepItem number="3" text={<>Pastikan nominal pembayaran <strong>Rp {formatPrice(price)}</strong> sudah benar.</>} />
                            <StepItem number="4" text="Pilih Konfirmasi Pembayaran dan ketikkan PIN keamanan akun Anda." />
                            <StepItem number="5" text="Tunggu beberapa saat sampai status pembayaran di aplikasi berubah menjadi 'Berhasil'." />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => navigate('/chat', { replace: true })}
                    className="w-full py-4 rounded-2xl bg-[#4A90D9] hover:bg-[#3A7BC8] text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    Kembali ke Dashboard
                  </button>
                </div>



              </div>
            </div>
          </div>
        )}

      </div>

      {/* Change Plan Modal (reuses PlanSelectionModal) */}
      <PlanSelectionModal
        open={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
        onSelectPlan={handleChangePlan}
      />
    </div>
  )
}
