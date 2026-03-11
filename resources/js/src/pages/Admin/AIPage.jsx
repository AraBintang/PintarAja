import {
  Check,
  CheckCircle2,
  Copy,
  Edit2,
  Key,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
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
import { usePlans } from '@/context/PlanContext'

export default function AdminAIPage() {
  const { plans } = usePlans()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState(null)
  const [selectedPlans, setSelectedPlans] = useState([])

  // Initial mock data updated with plans
  const [aiKeys, setAiKeys] = useState([
    {
      id: 1,
      name: 'Claude Key',
      code: 'SETTING-CLD',
      key: 'sk-ant-api03-4MRNTg...',
      status: 'Active',
      plans: [2, 3],
    },
    {
      id: 2,
      name: 'DeepSeek AI Key',
      code: 'SETTING-DSK',
      key: 'sk-f2c97cd4351b4c29a...',
      status: 'Active',
      plans: [1, 2, 3],
    },
    {
      id: 3,
      name: 'Gemini AI Key',
      code: 'SETTING-GMN',
      key: 'AIzaSyC-fTa5elXuYERX...',
      status: 'Active',
      plans: [2],
    },
    {
      id: 4,
      name: 'QWEN AI Key',
      code: 'SETTING-QWN',
      key: 'sk-518717d5c08f4f038...',
      status: 'Active',
      plans: [3],
    },
    {
      id: 5,
      name: 'Fiks Pintar Aja',
      code: 'SETTING-GPT',
      key: 'sk-proj-uYXg1yYig5gn...',
      status: 'Active',
      plans: [2, 3],
    },
    {
      id: 6,
      name: 'ini buat test segala test',
      code: 'SETTING-GPT',
      key: 'sk-proj-umxoQIL4zR67...',
      status: 'Inactive',
      plans: [],
    },
    {
      id: 7,
      name: 'GPT Key 3',
      code: 'SETTING-GPT',
      key: 'sk-proj-jRCkBmZ1i5is...',
      status: 'Inactive',
      plans: [],
    },
    {
      id: 8,
      name: 'GPT Key 2',
      code: 'SETTING-GPT',
      key: 'sk-proj-o441hfgVcxNZ...',
      status: 'Inactive',
      plans: [],
    },
    {
      id: 9,
      name: 'GPT Key',
      code: 'SETTING-GPT',
      key: 'sk-proj-oON4MJqY4OPa...',
      status: 'Inactive',
      plans: [2, 3],
    },
  ])

  const activeKeys = aiKeys.filter((k) => k.status === 'Active').length

  // Status badges styling
  const getStatusStyle = (status) => {
    return status === 'Active'
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-rose-50 text-rose-600 border-rose-100'
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto px-6 py-6 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                <Settings className="w-5 h-5 text-white" />
              </div>
              AI Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-[46px]">
              Kelola semua API Key AI dalam satu tempat
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add New AI Key
          </button>
        </div>

        {/* Stats & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-1 shadow-sm w-max">
            <div className="px-5 py-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-800/50 flex items-center justify-center">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Total Keys
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">
                  {aiKeys.length}
                </p>
              </div>
            </div>
            <div className="px-5 py-2.5 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Active
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-none">
                  {activeKeys}
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
              className="w-full h-full min-h-[52px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-11 pr-4 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Grid Layout that matches the screenshot concept but uses our premium style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiKeys
            .filter((k) => k.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group flex flex-col"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-800 dark:text-gray-100 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">
                      Setting Code: {item.code}
                    </p>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg border text-[12px] font-semibold flex items-center gap-1.5 ${getStatusStyle(item.status)}`}
                  >
                    {item.status === 'Active' ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                    )}
                    {item.status}
                  </div>
                </div>

                {/* Card Body - Key */}
                <div className="mb-4 flex-1">
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-3 border border-gray-100 dark:border-gray-700 group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-colors mb-4">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-[14px] font-mono text-gray-600 dark:text-gray-300 truncate">
                        {item.key}
                      </span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                      title="Copy Key"
                    >
                      <Copy className="w-4 h-4" />
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
                        item.plans.map((planId) => {
                          const plan = plans.find((p) => p.id === planId)
                          return (
                            <span
                              key={planId}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold border border-blue-100 dark:border-blue-800"
                            >
                              {plan?.name || `Plan ${planId}`}
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-[11px] text-gray-400 italic font-medium">
                          No plans assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                  {item.status === 'Inactive' ? (
                    <button className="text-[13px] font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all">
                      Activate
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => {
                        setEditingKey(item)
                        setSelectedPlans(item.plans || [])
                        setIsAddModalOpen(true)
                      }}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button className="flex items-center gap-1.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-lg transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Add AI Key Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg tracking-wide">
                  {editingKey ? 'Edit AI Key' : 'Add New AI Key'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingKey(null)
                    setSelectedPlans([])
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-5">
                  {/* AI Provider Name */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                      AI Provider / Name
                    </label>
                    <input
                      type="text"
                      defaultValue={editingKey?.name}
                      placeholder="e.g. GPT Key 4"
                      className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Setting Code */}
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                        Setting Code
                      </label>
                      <input
                        type="text"
                        defaultValue={editingKey?.code}
                        placeholder="e.g. SETTING-GPT"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                        Status
                      </label>
                      <Select defaultValue={editingKey?.status?.toLowerCase() || 'active'}>
                        <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 focus:bg-white dark:focus:bg-gray-800 transition-all">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectGroup>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue={editingKey?.key}
                        placeholder="sk-..."
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Subscription Plans Access */}
                  <div className="space-y-3">
                    <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      Subscription Plans Access
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                      {plans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => {
                            if (selectedPlans.includes(plan.id)) {
                              setSelectedPlans(selectedPlans.filter((id) => id !== plan.id))
                            } else {
                              setSelectedPlans([...selectedPlans, plan.id])
                            }
                          }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                            selectedPlans.includes(plan.id)
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              selectedPlans.includes(plan.id)
                                ? 'bg-white border-white'
                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {selectedPlans.includes(plan.id) && (
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            )}
                          </div>
                          <span className="text-[13px] font-bold truncate">{plan.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 italic">
                      Only users with the selected plans will be able to use this AI key.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setEditingKey(null)
                    setSelectedPlans([])
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    // Logic to save (mock)
                    setIsAddModalOpen(false)
                    setEditingKey(null)
                    setSelectedPlans([])
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
