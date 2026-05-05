import { differenceInHours, parseISO } from 'date-fns'
import {
  Crown,
  Edit2,
  Filter,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { useState } from 'react'

import DeleteModal from '@/components/DeleteModal'
import Pagination from '@/components/Pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import UserModal from '@/components/user/UserForm'
import { useSnackbar } from '@/context/SnackbarContext'
import { useUsers } from '@/helpers/useUsers'
import { Debounce } from '@/utils/Debounce'

function getInitials(name = '') {
  return name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

const avatarColors = [
  'bg-blue-600 dark:bg-orange-500',
  'bg-blue-500 dark:bg-orange-400',
  'bg-emerald-500 dark:bg-orange-600',
  'bg-blue-700 dark:bg-orange-700',
  'bg-blue-400 dark:bg-orange-300',
]
function getAvatarColor(name = '') {
  let hash = 0
  for (let i = 0; i < name?.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors?.length]
}

function getLastActiveStyle(lastActive) {
  if (!lastActive) {
    return 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-600'
  }

  const now = new Date()
  const lastActiveDate = parseISO(lastActive)
  const hoursDiff = differenceInHours(now, lastActiveDate)

  if (hoursDiff <= 1) {
    // Active within 1 hour - Green
    return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
  } else if (hoursDiff <= 24) {
    // Active within 24 hours - Yellow/Amber
    return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
  } else {
    // Inactive for more than 24 hours - Red
    return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
  }
}

const PAGE_SIZE = 10

export default function AdminUserPage() {
  const { showSnackbar } = useSnackbar()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterRole, setFilterRole] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  // const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = Debounce(searchQuery, 400)

  const { users, pagination, summary, loading, createUser, updateUser, deleteUser } = useUsers({
    search: debouncedSearch,
    role: filterRole,
    plan: filterPlan,
    // status: filterStatus,
    page,
    perPage: PAGE_SIZE,
  })

  const stats = [
    {
      label: 'Total Users',
      value: summary.total,
      icon: Users,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    // {
    //   label: 'Active Users',
    //   value: summary.active,
    //   icon: UserCheck,
    //   bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
    //   textColor: 'text-emerald-600 dark:text-emerald-400',
    // },
    {
      label: 'Admin',
      value: summary.admin,
      icon: Shield,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
    {
      label: 'Paid User',
      value: summary.premium,
      icon: Crown,
      bgLight: 'bg-blue-50 dark:bg-orange-900/20',
      textColor: 'text-blue-600 dark:text-orange-400',
    },
  ]

  const handleOpenAdd = () => {
    setEditTarget(null)
    setIsFormOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditTarget(user)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (payload) => {
    setActionLoading(true)
    try {
      if (editTarget) {
        await updateUser(editTarget.M_UserID, payload)
        showSnackbar('success', 'User berhasil diperbarui')
      } else {
        await createUser(payload)
        showSnackbar('success', 'User berhasil ditambahkan')
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
      await deleteUser(deleteTarget.M_UserID)
      showSnackbar('success', 'User berhasil dihapus')
      setDeleteTarget(null)
    } catch (err) {
      showSnackbar('error', err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const selectTriggerClass =
    'w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0'

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-16 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 dark:bg-orange-500 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-orange-900/30 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              User Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1">
              Kelola data pengguna dan langganan User
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 bg-blue-600 dark:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-orange-600 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-orange-900/30 transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow min-w-0"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}
                >
                  <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {loading ? '—' : stat.value}
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1 sm:max-w-[400px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by name or email..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
                showFilters
                  ? 'bg-blue-50 dark:bg-orange-900/20 border-blue-200 dark:border-orange-700 text-blue-700 dark:text-orange-400'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <Select
                value={filterRole}
                onValueChange={(v) => {
                  setFilterRole(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua Role</SelectItem>
                    <SelectItem value="A">Admin</SelectItem>
                    <SelectItem value="U">User</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={filterPlan}
                onValueChange={(v) => {
                  setFilterPlan(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua Plan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua Plan</SelectItem>
                    <SelectItem value="2">Premium Plan</SelectItem>
                    <SelectItem value="1">Free Account</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* <Select
                value={filterStatus}
                onValueChange={(v) => {
                  setFilterStatus(v === 'all' ? '' : v)
                  setPage(1)
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Y">Active</SelectItem>
                    <SelectItem value="N">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select> */}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  {['No.', 'User Info', 'Role', 'Subscription', 'Last Active', 'Action'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i >= 5 ? 'text-right' : i >= 2 ? 'text-center' : ''}`}
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
                ) : users?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-400 dark:text-gray-500 text-[14px]"
                    >
                      Tidak ada data user ditemukan
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.M_UserID}
                      className="hover:bg-blue-50/30 dark:hover:bg-orange-900/10 transition-colors"
                    >
                      <td className="px-6 py-3.5 text-[13px] text-gray-400 font-medium">
                        {(pagination?.current_page - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {/* <div
                            className={`w-9 h-9 rounded-full ${getAvatarColor(user.M_UserFullName)} flex items-center justify-center text-white text-[12px] font-bold shadow-sm flex-shrink-0`}
                          >
                            {getInitials(user.M_UserFullName)}
                          </div> */}

                          <div className="relative w-9 h-9 flex-shrink-0">
                            <div
                              className={`absolute inset-0 rounded-full ${getAvatarColor(user.M_UserFullName)} text-[12px] flex items-center font-bold shadow-sm flex-shrink-0 justify-center`}
                            >
                              <span className="text-white text-[14px] font-semibold">
                                {getInitials(user.M_UserFullName)}
                              </span>
                            </div>

                            {user?.M_UserImage && (
                              <img
                                src={user.M_UserImage}
                                alt={user.M_UserFullName}
                                referrerPolicy="no-referrer"
                                className="absolute inset-0 w-full h-full rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                              {user.M_UserFullName}
                            </p>
                            <p className="text-[12px] text-gray-400 truncate">{user.M_UserEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {user.M_UserRole === 'A' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-orange-700 dark:text-amber-400 text-[12px] font-semibold border border-orange-100 dark:border-amber-900/30">
                            <Crown className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[12px] font-semibold border border-gray-100 dark:border-gray-600">
                            <UserCheck className="w-3 h-3" />
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {user.M_UserPlan !== 1 ? (
                          <span className="text-[13px] font-medium text-blue-600 dark:text-orange-400 flex items-center justify-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-orange-400" />
                            Premium
                          </span>
                        ) : (
                          <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getLastActiveStyle(user.M_UserLastActive)}`}
                        >
                          {user.M_UserLastActive ?? '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            title="Edit"
                            className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-orange-900/20 hover:bg-blue-100 dark:hover:bg-orange-900/40 flex items-center justify-center text-blue-600 dark:text-orange-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            title="Delete"
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
              label="users"
              className="px-6 py-4 border-t border-gray-100 dark:border-gray-700"
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <UserModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editTarget}
        loading={actionLoading}
      />

      <DeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
        data={'User'}
        name={deleteTarget?.M_UserFullName ?? ''}
      />
    </div>
  )
}
