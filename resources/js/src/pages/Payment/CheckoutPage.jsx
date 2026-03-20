import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Monitor,
  Moon,
  ShieldCheck,
  Store,
  Sun,
  Wallet,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import alfamartImage from '@/assets/images/alfamart.png'
import bcaImage from '@/assets/images/bca.png'
import bniImage from '@/assets/images/bni.png'
import briImage from '@/assets/images/bri.png'
import bsiImage from '@/assets/images/bsi.png'
import danaImage from '@/assets/images/dana.png'
import indomaretImage from '@/assets/images/indomaret.png'
import mandiriImage from '@/assets/images/mandiri.png'
import ovoImage from '@/assets/images/ovo.png'
import qrisImage from '@/assets/images/qris.png'
import shopeePayImage from '@/assets/images/shopeepay.png'
import PlanSelectionModal from '@/components/plan/PlanSelectionModal'
import WhatsAppButton from '@/components/WhatsAppButton'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { useTheme } from '@/context/ThemeContext'
import { request } from '@/utils/Http'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

const PAYMENT_GROUPS = [
  {
    category: 'QRIS',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    methods: [{ id: 'qris', name: 'QRIS', channel: 'QRIS2', image: qrisImage }],
  },
  {
    category: 'E-Wallet',
    icon: <Wallet className="w-3.5 h-3.5" />,
    methods: [
      { id: 'dana', name: 'DANA', channel: 'DANA', image: danaImage },
      { id: 'ovo', name: 'OVO', channel: 'OVO', image: ovoImage },
      {
        id: 'shopeepay',
        name: 'ShopeePay',
        channel: 'SHOPEEPAY',
        image: shopeePayImage,
      },
    ],
  },
  {
    category: 'Virtual Account',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    methods: [
      { id: 'bca_va', name: 'BCA VA', channel: 'BCAVA', image: bcaImage },
      { id: 'bni_va', name: 'BNI VA', channel: 'BNIVA', image: bniImage },
      { id: 'bri_va', name: 'BRI VA', channel: 'BRIVA', image: briImage },
      { id: 'bsi_va', name: 'BSI VA', channel: 'BSIVA', image: bsiImage },
      {
        id: 'mandiri_va',
        name: 'Mandiri VA',
        channel: 'MANDIRIVA',
        image: mandiriImage,
      },
    ],
  },
  {
    category: 'Minimarket',
    icon: <Store className="w-3.5 h-3.5" />,
    methods: [
      {
        id: 'alfamart',
        name: 'Alfamart',
        channel: 'ALFAMART',
        image: alfamartImage,
      },
      {
        id: 'indomaret',
        name: 'Indomaret',
        channel: 'INDOMARET',
        image: indomaretImage,
      },
    ],
  },
]

const ALL_METHODS = PAYMENT_GROUPS.flatMap((g) => g.methods)

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()
  const { theme, toggleTheme } = useTheme()

  const [plan, setPlan] = useState(location.state?.plan ?? null)
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [changePlanOpen, setChangePlanOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!plan) navigate('/', { replace: true })
  }, [plan, navigate])

  if (!plan) return null

  const price = plan.selectedPrice ?? plan.price?.monthly_final ?? plan.price?.monthly ?? 0
  const selectedMethodObj = ALL_METHODS.find((m) => m.id === selectedMethod)

  const handleProceed = async () => {
    if (!phone.trim()) {
      showSnackbar('error', 'Masukkan nomor telepon')
      return
    }
    if (!selectedMethod) {
      showSnackbar('error', 'Pilih metode pembayaran')
      return
    }

    setSubmitting(true)
    try {
      const res = await request('/payments', {
        method: 'POST',
        body: {
          planId: plan.id,
          amount: price,
          channel: selectedMethodObj.channel,
          method: selectedMethod,
          item: plan.itemName ?? `${plan.name} - ${plan.selectedPeriodSuffix ?? 'Monthly'}`,
          phone,
        },
      })

      navigate('/payment', {
        state: {
          referenceId: res.referenceId,
          paymentCode: res.paymentCode,
          payUrl: res.payUrl,
          checkoutUrl: res.checkoutUrl,
          expiredAt: res.expiredAt,
          instructions: res.instructions ?? [],
          plan,
          price,
          selectedMethod,
        },
      })
    } catch (err) {
      showSnackbar('error', err.message ?? 'Gagal membuat transaksi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden
      bg-[#f0f4ff] dark:bg-[#0c0f1a]"
    >
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full
          bg-blue-200/60 dark:bg-blue-900/20 blur-[100px]"
        />
        <div
          className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full
          bg-indigo-200/50 dark:bg-indigo-900/20 blur-[120px]"
        />
        <div
          className="absolute -bottom-20 left-1/3 w-[350px] h-[350px] rounded-full
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
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const returnUrl = location.state?.returnUrl || '/chat'
                navigate(`${returnUrl}?settings=true&tab=plan&openPlans=true`)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white">Checkout</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pilih metode pembayaran</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="z-50 w-9 h-9 flex items-center justify-center rounded-xl bg-white/80 dark:bg-white/8 backdrop-blur border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-all shadow-sm"
          >
            {theme === 'light' && <Sun size={15} />}
            {theme === 'dark' && <Moon size={15} />}
            {theme === 'system' && <Monitor size={15} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative z-[1]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-7">
              {PAYMENT_GROUPS.map((group) => (
                <div key={group.category}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400 dark:text-gray-500">{group.icon}</span>
                    <h3 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      {group.category}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {group.methods.map((method) => {
                      const isActive = selectedMethod === method.id
                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95
                            min-w-[130px] backdrop-blur-sm ${
                              isActive
                                ? 'border-blue-500 dark:border-orange-500 bg-white dark:bg-gray-800 shadow-md shadow-blue-100/60 dark:shadow-orange-900/30'
                                : 'border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-800'
                            }`}
                        >
                          <div className="w-10 h-6 rounded flex items-center justify-center bg-gray-50 dark:bg-white/90 p-0.5 shrink-0">
                            <img
                              src={method.image}
                              alt={method.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {method.name}
                          </span>
                          {isActive && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 dark:text-orange-400 absolute top-2 right-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Info Pembayaran</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Email', value: user?.email },
                    { label: 'Nama', value: user?.name },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
                      <div className="px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                        {value ?? '-'}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">
                      No. Telepon <span className="text-red-400">*</span>
                    </p>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/60 text-sm text-gray-800 dark:text-gray-200
                        border border-gray-200 dark:border-gray-700
                        focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/20
                        focus:border-blue-400 dark:focus:border-orange-400
                        outline-none transition-all placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/60 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-gray-400">{plan.tagLine}</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                      {plan.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.selectedPeriodSuffix ?? 'Monthly'}
                    </p>
                  </div>
                  <button
                    onClick={() => setChangePlanOpen(true)}
                    className="text-xs font-bold text-blue-600 dark:text-orange-400 hover:underline shrink-0 mt-0.5"
                  >
                    Ganti
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{plan.name}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      Rp {formatPrice(price)}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-extrabold text-gray-900 dark:text-white">
                      Rp {formatPrice(price)}
                    </span>
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60
                      text-white font-bold text-sm flex items-center justify-center gap-2
                      transition-all active:scale-[0.98] shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 mt-2"
                  >
                    {submitting ? (
                      <span className="opacity-80">Memproses...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Bayar Sekarang
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center leading-relaxed">
                    Dengan melanjutkan, kamu menyetujui syarat & ketentuan. Pembayaran tidak dapat
                    dikembalikan.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pembayaran aman & terenkripsi via Tripay
              </div>
            </div>
          </div>
        </div>
      </div>

      <PlanSelectionModal
        open={changePlanOpen}
        onClose={() => setChangePlanOpen(false)}
        onSelectPlan={(newPlan) => {
          setPlan(newPlan)
          setChangePlanOpen(false)
        }}
      />

      <WhatsAppButton />
    </div>
  )
}
