import {
  CheckCircle2,
  Copy,
  Edit2,
  Key,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'

import AIForm from '@/components/ai/AIForm'
import DeleteModal from '@/components/DeleteModal'
import { useSnackbar } from '@/context/SnackbarContext'
import { useAIs } from '@/helpers/useAIs'
import { Debounce } from '@/utils/Debounce'

export default function AIPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const {
    aiKeys,
    summary,
    plans,
    loading,
    createAiKey,
    updateAiKey,
    activateAiKey,
    deactivateAiKey,
    deleteAiKey,
  } = useAIs({ search: debouncedSearch })

  const handleCopy = (key, id) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditTarget(item)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        await updateAiKey(editTarget.id, payload)
        showSnackbar('success', 'AI Key berhasil diperbarui')
      } else {
        await createAiKey(payload)
        showSnackbar('success', 'AI Key berhasil ditambahkan')
      }
      setIsFormOpen(false)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleActive = async (item) => {
    setActionLoading(true)
    try {
      if (item.isActive === 'Y') {
        await deactivateAiKey(item.id)
        showSnackbar('success', `${item.name} dinonaktifkan`)
      } else {
        await activateAiKey(item.id)
        showSnackbar('success', `${item.name} diaktifkan`)
      }
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
      await deleteAiKey(deleteTarget.id)
      showSnackbar('success', 'AI Key berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusStyle = (isActive) =>
    isActive === 'Y'
      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
      : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              AI Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola semua API Key AI dalam satu tempat
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New AI Key
          </button>
        </div>

        {/* Stats & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-1 shadow-sm w-full md:w-max">
            <div className="px-5 py-2.5 rounded-xl bg-blue-50/50 dark:bg-orange-900/20 flex items-center gap-3 flex-1 md:flex-none">
              <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-orange-800/30 flex items-center justify-center">
                <Key className="w-4 h-4 text-blue-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Total Keys
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">
                  {loading ? '—' : summary.total}
                </p>
              </div>
            </div>
            <div className="px-5 py-2.5 rounded-xl flex items-center gap-3 flex-1 md:flex-none">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Active
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">
                  {loading ? '—' : summary.active}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari AI Key..."
              className="w-full h-full min-h-[52px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 h-52 animate-pulse"
              />
            ))}
          </div>
        ) : aiKeys.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-20 text-center text-gray-400 dark:text-gray-500 text-[14px]">
            Tidak ada AI Key ditemukan
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {aiKeys.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-orange-900/40 transition-all group flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 pr-3">
                    <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-100 mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium truncate">
                      Setting Code: {item.code}
                    </p>
                    {item.model && (
                      <p className="text-[11px] text-gray-400 mt-0.5">Model: {item.model}</p>
                    )}
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-[12px] font-semibold flex items-center gap-1.5 shrink-0 ${getStatusStyle(item.isActive)}`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isActive === 'Y' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    {item.isActive === 'Y' ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {/* API Key */}
                <div className="mb-4 flex-1">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-100 dark:border-gray-700 group-hover:bg-blue-50/30 dark:group-hover:bg-orange-900/10 group-hover:border-blue-100 dark:group-hover:border-orange-900/30 transition-colors mb-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[13px] font-mono text-gray-600 dark:text-gray-300 truncate">
                        {item.apiKey}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.apiKey, item.id)}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-orange-400 transition-colors p-1 shrink-0"
                      title="Copy Key"
                    >
                      {copiedId === item.id ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Authorized Plans */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Authorized Plans
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.plans && item.plans.length > 0 ? (
                        item.plans.map((plan) => (
                          <span
                            key={plan.id}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-orange-900/20 text-blue-600 dark:text-orange-400 rounded-md text-[10px] font-bold border border-blue-100 dark:border-orange-900/30"
                          >
                            {plan.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-gray-400 italic font-medium">
                          No plans assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  {item.isActive === 'N' ? (
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={actionLoading}
                      className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(item)}
                      disabled={actionLoading}
                      className="text-[13px] font-semibold text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-orange-400 hover:bg-blue-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AIForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditTarget(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        plans={plans}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'AI Key'}
        name={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
