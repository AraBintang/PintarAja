import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  Loader2,
  Share2,
  Sparkles,
  Tag,
  Users,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

export default function ReferralTab() {
  const { showSnackbar } = useSnackbar()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const { referral_code, total_referrals, pending_discount, has_free_month, progress, usages } =
    data || {}

  const fetchReferral = async () => {
    setLoading(true)
    try {
      const res = await request('/referrals')
      setData(res)
    } catch {
      showSnackbar('error', 'Gagal memuat data referral')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferral()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleActivate = async () => {
    setActivating(true)
    try {
      await request('/referrals/activate', { method: 'POST' })
      showSnackbar('success', 'Kode referral berhasil diaktifkan!')
      fetchReferral()
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengaktifkan referral')
    } finally {
      setActivating(false)
    }
  }

  const handleCopyCode = () => {
    if (!data?.referral_code) return
    navigator.clipboard.writeText(data.referral_code)
    setCopied(true)
    showSnackbar('success', 'Kode disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyLink = () => {
    if (!data?.referral_link) return
    navigator.clipboard.writeText(data.referral_link)
    showSnackbar('success', 'Link referral disalin!')
  }

  const handleShare = () => {
    if (!data?.referral_link) return
    if (navigator.share) {
      navigator.share({
        title: 'Pintaraja',
        text: `Coba Pintaraja dengan kode referral aku: ${data.referral_code}`,
        url: data.referral_link,
      })
    } else {
      handleCopyLink()
    }
  }

  const handleClaimFreeMonth = async () => {
    setClaiming(true)
    try {
      await request('/referrals/claim-free-month', { method: 'POST' })
      showSnackbar('success', '🎉 Free 1 bulan berhasil diklaim!')
      fetchReferral()
      // Reload user data biar subscription_expired_at terupdate
      window.location.reload()
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal mengklaim reward')
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-white dark:bg-gray-900 mt-58">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    )
  }

  // ── Main content ───────────────────────────────────────────
  return (
    <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-x-3 gap-y-2">
          <div className="flex items-center gap-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 dark:bg-orange-500/10 dark:border-orange-500/20 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-blue-500 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Referral Program
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Undang teman, kumpulkan diskon, dan dapatkan free 1 bulan!
          </p>
        </div>
        {!data?.referral_code ? (
          <div className="flex-1 bg-white dark:bg-gray-900 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-2xl">
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-7 h-7 text-blue-500 dark:text-orange-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  Aktifkan Kode Referral
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Kamu belum punya kode referral. Aktifkan sekarang dan mulai undang teman untuk
                  mendapatkan diskon hingga gratis 1 bulan!
                </p>
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm transition-all active:scale-95"
                >
                  {activating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {activating ? 'Mengaktifkan...' : 'Aktifkan Referral'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Reward alert — jika ada pending reward */}
            {has_free_month && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      🎉 Kamu dapat Free 1 Bulan!
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      7 teman sudah bergabung menggunakan kode referralmu. Klik tombol di bawah
                      untuk mengaktifkan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClaimFreeMonth}
                  disabled={claiming}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {claiming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {claiming ? 'Mengklaim...' : 'Klaim Free 1 Bulan Sekarang'}
                </button>
              </div>
            )}

            {/* Reward alert — diskon pending (tetap otomatis saat checkout) */}
            {!has_free_month && pending_discount > 0 && (
              <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    Diskon {pending_discount}% menunggumu!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Akan otomatis dipotong saat kamu checkout plan weekly dan monthly berikutnya.
                  </p>
                </div>
              </div>
            )}

            {/* Kode Referral Card */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 dark:from-orange-400 dark:via-orange-500 dark:to-amber-400" />
              <div className="p-6 bg-gray-50 dark:bg-gray-800/40 space-y-4">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Kode Referral Kamu
                </p>

                {/* Kode besar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 font-mono text-2xl font-extrabold tracking-[0.2em] text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-3 text-center">
                    {referral_code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 transition-all active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-sm font-semibold transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: <Users className="w-4 h-4 text-blue-500" />,
                  label: 'Total Referral',
                  value: total_referrals,
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                },
                {
                  icon: <Tag className="w-4 h-4 text-emerald-500" />,
                  label: 'Diskon Pending',
                  value: `${pending_discount}%`,
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                },
                {
                  icon: <Zap className="w-4 h-4 text-orange-500" />,
                  label: 'Lagi ke Free',
                  value: progress.to_next_free === 0 ? '🎉' : `${progress.to_next_free} org`,
                  bg: 'bg-orange-50 dark:bg-orange-900/20',
                },
              ].map(({ icon, label, value, bg }) => (
                <div
                  key={label}
                  className={`rounded-2xl border border-gray-100 dark:border-gray-800 p-4 text-center ${bg}`}
                >
                  <div className="flex items-center justify-center mb-1.5">{icon}</div>
                  <p className="text-lg font-extrabold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress siklus 7 orang */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Progress ke Free 1 Bulan
                </p>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {progress.current_in_cycle}/7
                </span>
              </div>

              {/* Track 7 lingkaran */}
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 7 }).map((_, i) => {
                  const filled = i < progress.current_in_cycle
                  const isLast = i === 6
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      {isLast && (
                        <span className="text-[9px] font-bold text-emerald-500">FREE</span>
                      )}
                      <div
                        className={`w-full h-2.5 rounded-full transition-all ${
                          filled
                            ? isLast
                              ? 'bg-emerald-400 mb-0'
                              : 'bg-blue-500 dark:bg-orange-400 mt-4.5'
                            : isLast
                              ? 'bg-gray-200 dark:bg-gray-700'
                              : 'bg-gray-200 dark:bg-gray-700 mt-[17px]'
                        }`}
                      />
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {progress.to_next_free === 0
                  ? '🎉 Kamu sudah dapat free 1 bulan! Siklus baru dimulai.'
                  : progress.to_next_free === 1
                    ? '🔥 Tinggal 1 orang lagi untuk mendapatkan free 1 bulan!'
                    : `Undang ${progress.to_next_free} orang lagi dan melakukan pembelian untuk free 1 bulan plan berbayar. Setiap orang yang bergabung memberikan diskon 10%.`}
              </p>
            </div>

            {/* Cara kerja */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Cara Kerja</p>
              <div className="space-y-2.5">
                {[
                  {
                    num: '1–6',
                    desc: 'Setiap teman yang mendaftar & melakukan pembelian berapapun +10% diskon untukmu (max 60%)',
                    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
                  },
                  {
                    num: '7',
                    desc: 'Orang ke-7 = kamu dapat FREE 1 bulan plan berbayar!',
                    color:
                      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
                  },
                  {
                    num: '8+',
                    desc: 'Siklus berulang — orang ke-8 mulai siklus diskon baru lagi',
                    color:
                      'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
                  },
                ].map(({ num, desc, color }) => (
                  <div key={num} className="flex items-start gap-3">
                    <span
                      className={`shrink-0 text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${color}`}
                    >
                      #{num}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pt-0.5">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Riwayat referral */}
            {usages.length > 0 && (
              <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Riwayat Referral ({usages.length})
                  </p>
                </div>
                <div className="divide-y divide-gray-50 dark:divide-gray-800">
                  {usages.map((u) => (
                    <div
                      key={u.sequence}
                      className="px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 text-sm font-bold text-gray-500 dark:text-gray-400">
                          {u.sequence}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {u.user_name}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{u.joined_at}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            u.reward_type === 'free_month'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {u.reward_label}
                        </span>
                        {u.is_used && (
                          <CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
