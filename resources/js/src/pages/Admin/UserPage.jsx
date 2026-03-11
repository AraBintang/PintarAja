import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit2,
  Filter,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MOCK_USERS = [
  {
    id: 1,
    name: 'Ubaidillah',
    email: 'ubaid.namaku@gmail.com',
    role: 'Admin',
    plan: 'Premium Plan',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '12 Jan 2025',
  },
  {
    id: 2,
    name: 'Heri Suryawan',
    email: 'heriabunizar@gmail.com',
    role: 'Admin',
    plan: 'Free Account',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '08 Feb 2025',
  },
  {
    id: 3,
    name: "Muhammad Nas'al",
    email: 'aveyound@gmail.com',
    role: 'Admin',
    plan: 'Free Account',
    status: 'Active',
    quota: '0',
    joinDate: '15 Feb 2025',
  },
  {
    id: 4,
    name: 'REZA SETYAWAN',
    email: 'reza84138@smk.belajar.id',
    role: 'User',
    plan: 'Premium Plan',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '20 Feb 2025',
  },
  {
    id: 5,
    name: 'rafha arya',
    email: 'wicaksonorafha@gmail.com',
    role: 'User',
    plan: 'Free Account',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '22 Feb 2025',
  },
  {
    id: 6,
    name: 'It Jumpwin',
    email: 'itjumpwin@gmail.com',
    role: 'User',
    plan: 'Free Account',
    status: 'Inactive',
    quota: 'Unlimited',
    joinDate: '25 Feb 2025',
  },
  {
    id: 7,
    name: 'accounting jumpwin',
    email: 'jumpwin.accnt@gmail.com',
    role: 'User',
    plan: 'Free Account',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '28 Feb 2025',
  },
  {
    id: 8,
    name: 'APSARI DEONITA TEYN',
    email: 'shariteyn@gmail.com',
    role: 'User',
    plan: 'Premium Plan',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '01 Mar 2025',
  },
  {
    id: 9,
    name: "THORIQ Dhiyaa'",
    email: 'jellyheadjelly@gmail.com',
    role: 'User',
    plan: 'Free Account',
    status: 'Inactive',
    quota: 'Unlimited',
    joinDate: '02 Mar 2025',
  },
  {
    id: 10,
    name: 'Acied Rasyid',
    email: 'acied.ilove@gmail.com',
    role: 'User',
    plan: 'Free Account',
    status: 'Active',
    quota: 'Unlimited',
    joinDate: '03 Mar 2025',
  },
]

/* ─── Helper: get initials from name ─── */
function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/* ─── Helper: avatar color from name ─── */
const avatarColors = [
  'bg-blue-600',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-blue-700',
  'bg-blue-400',
  'bg-blue-800',
  'bg-blue-600',
  'bg-blue-500',
]
function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function AdminUserPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    status: '',
    plan: '',
    role: '',
  })

  const totalUsers = 713
  const activeUsers = MOCK_USERS.filter((u) => u.status === 'Active').length
  const adminUsers = MOCK_USERS.filter((u) => u.role === 'Admin').length
  const premiumUsers = MOCK_USERS.filter((u) => u.plan === 'Premium Plan').length

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Active Users',
      value: `${activeUsers}/${MOCK_USERS.length}`,
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Admin',
      value: adminUsers,
      icon: Shield,
      color: 'from-blue-400 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Premium',
      value: premiumUsers,
      icon: Crown,
      color: 'from-blue-500 to-blue-700',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
  ]

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6 font-sans">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              User Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1 sm:ml-[46px]">
              Kelola data pengguna, langganan, dan status akun
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow group min-w-0"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div
                  className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${stat.bgLight} flex items-center justify-center`}
                >
                  <stat.icon className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${stat.textColor}`} />
                </div>
                <span className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {stat.value}
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-3.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
                showFilters
                  ? 'bg-violet-50 border-violet-200 text-violet-700'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                  <SelectValue placeholder="Semua Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                  <SelectValue placeholder="Semua Plan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="premium">Premium Plan</SelectItem>
                    <SelectItem value="free">Free Account</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Table wrapper */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No.
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User Info
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {MOCK_USERS.map((user, index) => (
                  <tr key={user.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="px-6 py-3.5 text-[13px] text-gray-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full ${getAvatarColor(user.name)} flex items-center justify-center text-white text-[12px] font-bold shadow-sm flex-shrink-0`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {user.name}
                          </p>
                          <p className="text-[12px] text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.role === 'Admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 text-orange-700 text-[12px] font-semibold border border-orange-100">
                          <Crown className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[12px] font-semibold border border-gray-100 dark:border-gray-700">
                          <UserCheck className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {user.plan === 'Premium Plan' ? (
                        <span className="text-[13px] font-medium text-violet-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
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
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 transition-opacity">
                        <button
                          title="Edit"
                          className="w-8 h-8 rounded-lg bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Delete"
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Menampilkan{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">1-10</span> dari{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">713</span> user
            </p>
            <div className="flex items-center gap-1.5">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[13px] shadow-sm shadow-blue-200 dark:shadow-none">
                1
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 font-medium text-[13px] hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                2
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 font-medium text-[13px] hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                3
              </button>
              <span className="text-gray-400 text-sm px-1">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 font-medium text-[13px] hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                72
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg tracking-wide">Input Data User</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                  />
                </div>
                {/* E-mail */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                  />
                </div>
                {/* Password */}
                <div className="space-y-2 col-span-1 md:col-span-2 mb-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors"
                  />
                </div>
                {/* Active Status */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Active Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-colors">
                      <SelectValue placeholder="Active" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* Plan */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Subscription Plan
                  </label>
                  <Select
                    value={formData.plan}
                    onValueChange={(val) => setFormData({ ...formData, plan: val })}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-colors">
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="free">Free Account</SelectItem>
                        <SelectItem value="premium">Premium Plan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* Role */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Role
                  </label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                  >
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-colors">
                      <SelectValue placeholder="User" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
