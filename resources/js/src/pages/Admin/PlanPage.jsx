import { Edit2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useState } from 'react'

import DeleteModal from '@/components/DeleteModal'
import PlanForm from '@/components/plan/PlanForm'
import { useSnackbar } from '@/context/SnackbarContext'
import { usePlans } from '@/helpers/usePlans'

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price)
}

export default function PlanPage() {
  const { showSnackbar } = useSnackbar()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { plans, aiList, loading, createPlan, updatePlan, deletePlan } = usePlans()

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (plan) => {
    setEditTarget(plan)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        await updatePlan(editTarget.id, payload)
        showSnackbar('success', 'Plan berhasil diperbarui')
      } else {
        await createPlan(payload)
        showSnackbar('success', 'Plan berhasil ditambahkan')
      }
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
      await deletePlan(deleteTarget.id)
      showSnackbar('success', 'Plan berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Plan Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Atur paket berlangganan dan fitur yang tersedia
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Plan
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-orange-900/10 p-4 rounded-xl border border-blue-100 dark:border-orange-900/30 flex items-start gap-2">
            <span className="font-bold text-blue-600 dark:text-orange-400 min-w-10">*Note:</span>
            Perbandingan plan feature di landing page sesuai dengan feature yang ada pada plan.
            Samakan feature untuk mencentang plan dengan feature yang sama.
          </p>
        </div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-[24px] h-80 animate-pulse border border-gray-100 dark:border-gray-700"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white dark:bg-gray-800 rounded-[24px] p-6 lg:p-8 border relative flex flex-col ${
                  plan.isPopular === 'Y'
                    ? 'border-blue-500 dark:border-orange-500 border-2 shadow-lg shadow-blue-100/50 dark:shadow-orange-900/20'
                    : 'border-gray-200 dark:border-gray-700 shadow-sm'
                }`}
              >
                {/* Action buttons */}
                <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="w-10 h-10 rounded-full bg-blue-600 dark:bg-orange-500 text-white flex items-center justify-center hover:bg-blue-700 dark:hover:bg-orange-600 shadow-lg hover:scale-110 transition-transform"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {plan.id !== 1 && (
                    <button
                      onClick={() => setDeleteTarget(plan)}
                      className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-lg hover:scale-110 transition-transform"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-center mb-6">
                  <h3 className="text-[22px] font-bold text-gray-900 dark:text-white mb-3">
                    {plan.name}
                  </h3>
                  <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed min-h-[50px]">
                    {plan.tagLine}
                  </p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                    <span className="text-xl font-bold text-gray-400 line-through decoration-1">
                      Rp {formatPrice(plan.price?.monthly ?? 0)}
                    </span>
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold text-[#118A43]">
                        Rp{' '}
                        {plan.price?.discounted === 0
                          ? '0'
                          : formatPrice(plan.price?.discounted ?? 0)}
                      </span>
                      <span className="text-xl font-medium text-[#118A43] mb-0.5">/bln</span>
                    </div>
                  </div>
                  {plan.isPopular === 'Y' && (
                    <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                      ⭐ Most Popular
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  <button className="w-full py-3.5 rounded-full font-bold text-[14px] bg-[#295cce] dark:bg-orange-500 text-white hover:bg-[#1a4baf] dark:hover:bg-orange-600 shadow-md hover:shadow-lg transition-all">
                    Pilih Plan
                  </button>
                </div>

                <div className="flex-1">
                  <ul className="space-y-4">
                    {(plan.features ?? []).map((feature, idx) => (
                      <li
                        key={idx}
                        className={`flex items-start gap-3 ${feature.isIncluded === false ? 'opacity-40' : ''}`}
                      >
                        <Sparkles className="w-4 h-4 text-blue-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-[13px] font-bold text-gray-900 dark:text-white">
                            {feature.title}
                          </h4>
                          <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                            {feature.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Linked AI */}
                {plan.aiSettings && plan.aiSettings.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      AI Linked
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.aiSettings.map((ai) => (
                        <span
                          key={ai.id}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-orange-900/20 text-blue-600 dark:text-orange-400 text-[10px] font-bold border border-blue-100 dark:border-orange-900/30"
                        >
                          {ai.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <PlanForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditTarget(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        aiList={aiList}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'Plan'}
        name={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
