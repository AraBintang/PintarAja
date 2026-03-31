import { Edit2, Globe, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import DeleteModal from '@/components/DeleteModal'
import WebSettingForm from '@/components/webSetting/WebSettingForm'
import { useSnackbar } from '@/context/SnackbarContext'
import { useWebSettings } from '@/helpers/useWebSettings'

export default function WebSettingPage() {
  const { showSnackbar } = useSnackbar()
  const { settings, loading, createSetting, updateSetting, deleteSetting } = useWebSettings()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }
  const handleOpenEdit = (s) => {
    setEditTarget(s)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        await updateSetting(editTarget.id, payload)
        showSnackbar('success', 'Setting berhasil diperbarui')
      } else {
        await createSetting(payload)
        showSnackbar('success', 'Setting berhasil ditambahkan')
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
      await deleteSetting(deleteTarget.id)
      showSnackbar('success', 'Setting berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Web Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola konfigurasi tampilan dan konten website
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Setting
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {['No.', 'Key', 'Label', 'Value', 'Action'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3.5 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider
                        ${i === 0 ? 'w-[60px]' : ''}
                        ${i === 4 ? 'text-right w-[120px]' : ''}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : settings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-[14px]"
                    >
                      Belum ada setting yang ditambahkan.
                    </td>
                  </tr>
                ) : (
                  settings.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-blue-50/20 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-400">
                        {index + 1}.
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[12px] bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-orange-400 px-2 py-1 rounded-lg font-mono">
                          {item.key}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-600 dark:text-gray-300">
                        {item.label ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500 dark:text-gray-400 max-w-[300px] truncate">
                        {item.value ?? '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <WebSettingForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditTarget(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data="Setting"
        name={deleteTarget?.label ?? deleteTarget?.key ?? ''}
      />
    </div>
  )
}
