import { format, parseISO } from 'date-fns'
import { CheckCircle2, Copy, Key, Plus, Trash2, Users, Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'

import DeleteModal from '@/components/DeleteModal'
import Pagination from '@/components/Pagination'
import { useSnackbar } from '@/context/SnackbarContext'
import { useApiTokens } from '@/helpers/useApiTokens'

const PAGE_SIZE = 10

export default function ApiTokenPage() {
  const { showSnackbar } = useSnackbar()

  const [page, setPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [generatedToken, setGeneratedToken] = useState(null)

  const { tokens, pagination, loading, createToken, deleteToken, searchUsers } = useApiTokens({
    page,
    perPage: PAGE_SIZE,
  })

  // Modal State
  const [userId, setUserId] = useState('')
  const [tokenName, setTokenName] = useState('api-access')
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])

  useEffect(() => {
    if (userSearch.length > 1) {
      const timer = setTimeout(() => {
        searchUsers(userSearch).then(setSearchResults)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [userSearch])

  const handleOpenAdd = () => {
    setGeneratedToken(null)
    setUserId('')
    setTokenName('api-access')
    setUserSearch('')
    setSearchResults([])
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      showSnackbar('error', 'Silakan pilih User terlebih dahulu')
      return
    }

    setActionLoading(true)
    try {
      const res = await createToken({ user_id: userId, token_name: tokenName })
      setGeneratedToken(res.token)
      showSnackbar('success', 'API Token berhasil dibuat')
    } catch (err) {
      showSnackbar('error', err?.response?.data?.message || err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    try {
      await deleteToken(deleteTarget.id)
      showSnackbar('success', 'Token berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    showSnackbar('success', 'Token copied to clipboard!')
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              API Access Tokens
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola API Token untuk akses pelanggan ke sistem Pintaraja.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Generate New Token
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {['No.', 'User Info', 'Token Name', 'Last Used', 'Created At', 'Action'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 5 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : tokens?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada token yang ditemukan
                    </td>
                  </tr>
                ) : (
                  tokens.map((token, index) => (
                    <tr
                      key={token.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-[13px] text-gray-400 font-medium">
                        {(pagination?.current_page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {token.user_name}
                          </p>
                          <p className="text-[12px] text-gray-400 truncate">{token.user_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300">
                          {token.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {token.last_used_at ? (
                          <span className="text-[12px] text-gray-500 dark:text-gray-400">
                            {format(parseISO(token.last_used_at), 'dd MMM yyyy HH:mm')}
                          </span>
                        ) : (
                          <span className="text-[12px] text-gray-400 italic">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[12px] text-gray-500 dark:text-gray-400">
                          {format(parseISO(token.created_at), 'dd MMM yyyy HH:mm')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(token)}
                          title="Revoke Token"
                          className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 inline-flex items-center justify-center text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination?.current_page}
              totalPages={pagination.last_page}
              total={pagination.total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              label="tokens"
              className="px-6 py-4 border-t border-gray-100 dark:border-gray-700"
            />
          )}
        </div>
      </div>

      {/* Generate Token Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-[500px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Generate API Access Token
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Buat token baru untuk memberikan akses API kepada User.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {generatedToken ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Token Berhasil Dibuat!
                  </div>
                  <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mb-4">
                    Pastikan Anda segera menyalin (*copy*) token ini sekarang. Sistem tidak akan menampilkannya lagi demi alasan keamanan.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={generatedToken}
                      className="w-full font-mono text-sm px-3 py-2 border border-emerald-200 dark:border-emerald-800 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 outline-none"
                    />
                    <button
                      onClick={() => handleCopy(generatedToken)}
                      className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <form id="generate-token-form" onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Pilih Pelanggan (Cari berdasarkan nama/email)
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Ketik nama atau email..."
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value)
                          setUserId('') // reset selected user if typing new search
                        }}
                      />
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && !userId && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => {
                              setUserId(u.id)
                              setUserSearch(`${u.name} (${u.email})`)
                              setSearchResults([])
                            }}
                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex flex-col"
                          >
                            <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{u.name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Nama Token (Opsional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={tokenName}
                      onChange={(e) => setTokenName(e.target.value)}
                      placeholder="Contoh: api-access"
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                {generatedToken ? 'Tutup' : 'Batal'}
              </button>
              {!generatedToken && (
                <button
                  type="submit"
                  form="generate-token-form"
                  disabled={actionLoading || !userId}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 dark:bg-blue-500 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Menyimpan...' : 'Generate Token'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'Token'}
        name={deleteTarget?.name ?? ''}
      />
    </div>
  )
}
