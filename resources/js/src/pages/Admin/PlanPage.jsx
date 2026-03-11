import { Check, Edit2, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { usePlans } from '@/context/PlanContext'

export default function AdminPlanPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { plans, updatePlan } = usePlans()

  // State for the plan currently being edited
  const [editingPlan, setEditingPlan] = useState(null)

  // State for new custom feature
  const [newFeatureTitle, setNewFeatureTitle] = useState('')
  const [newFeatureAI, setNewFeatureAI] = useState('')

  const handleEditClick = (plan) => {
    setEditingPlan({ ...plan })
    setIsAddModalOpen(true)
  }

  const handleSave = () => {
    if (editingPlan) {
      updatePlan(editingPlan.id, editingPlan)
    }
    setIsAddModalOpen(false)
    setEditingPlan(null)
  }

  const handleClose = () => {
    setIsAddModalOpen(false)
    setEditingPlan(null)
    setNewFeatureTitle('')
    setNewFeatureAI('')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] text-gray-600 dark:text-gray-300 overflow-y-auto px-6 py-6 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              Plan Setting
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 ml-[46px]">
              Atur paket berlangganan dan fitur yang tersedia
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px]"
          >
            <Plus className="w-4 h-4" />
            Add New Plan
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
            <span className="font-bold text-blue-600 dark:text-blue-400 min-w-10">*Note:</span>
            Perbandingan plan feature di landing page sesuai dengan feature yang ada pada plan.
            samakan feature untuk mencentang plan dengan feature yang sama
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-[24px] p-8 px-6 lg:px-8 border relative flex flex-col ${
                plan.id === 1
                  ? 'border-blue-500 border-2 shadow-lg shadow-blue-100/50 dark:shadow-none'
                  : 'border-gray-200 dark:border-gray-700 shadow-sm'
              }`}
            >
              {/* Actions Overlay */}
              <div className="absolute -top-3 -right-3 flex items-center gap-2 z-10">
                <button
                  onClick={() => handleEditClick(plan)}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-lg dark:shadow-none hover:scale-110 transition-transform"
                  title="Edit Plan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {plan.id !== 1 && (
                  <button
                    className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-lg dark:shadow-none hover:scale-110 transition-transform"
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
                <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed min-h-[60px]">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xl font-bold text-gray-400 line-through decoration-1">
                    Rp {formatPrice(plan.price.monthly)}
                  </span>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold text-[#118A43]">
                      Rp {plan.price.discounted === 0 ? '0' : formatPrice(plan.price.discounted)}
                    </span>
                    <span className="text-xl font-medium text-[#118A43] mb-0.5">/bln</span>
                  </div>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium">
                  {plan.billingText}
                </p>
              </div>

              <div className="mb-10">
                <button className="w-full py-3.5 rounded-full font-bold text-[14px] bg-[#295cce] text-white hover:bg-[#1a4baf] shadow-md hover:shadow-lg transition-all">
                  {plan.buttonText}
                </button>
              </div>

              <div className="flex-1">
                <ul className="space-y-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-0.5 opacity-80">{feature.icon}</div>
                      <div>
                        <h4 className="text-[14px] font-bold text-gray-900 dark:text-white mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-[1.6]">
                          {feature.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg tracking-wide">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Basics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        value={editingPlan?.name || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        placeholder="e.g. Pro Account"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                        Description
                      </label>
                      <input
                        type="text"
                        value={editingPlan?.description || ''}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, description: e.target.value })
                        }
                        placeholder="e.g. Best for growing teams"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Pricing
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 block">
                          Regular Monthly (Rp)
                        </label>
                        <input
                          type="number"
                          value={editingPlan?.price?.monthly || 0}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              price: { ...editingPlan.price, monthly: Number(e.target.value) },
                            })
                          }
                          placeholder="0"
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-gray-500 dark:text-gray-400 block">
                          Discounted Monthly (Rp)
                        </label>
                        <input
                          type="number"
                          value={editingPlan?.price?.discounted || 0}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              price: { ...editingPlan.price, discounted: Number(e.target.value) },
                            })
                          }
                          placeholder="0"
                          className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <div>
                      <h4 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Included
                        Features
                      </h4>

                      <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4 max-h-[300px] overflow-y-auto">
                        {editingPlan?.features?.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg group hover:border-blue-200 transition-all"
                          >
                            <label className="flex items-start gap-3 cursor-pointer flex-1">
                              <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-gray-300 bg-white dark:bg-gray-800 group-hover:border-blue-400 transition-colors flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={feature.isIncluded !== false}
                                  onChange={(e) => {
                                    const newFeatures = [...editingPlan.features]
                                    newFeatures[idx] = { ...feature, isIncluded: e.target.checked }
                                    setEditingPlan({ ...editingPlan, features: newFeatures })
                                  }}
                                  className="peer opacity-0 absolute inset-0 cursor-pointer"
                                />
                                <Check className="w-3.5 h-3.5 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                              </div>
                              <div>
                                <span className="text-[13px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 transition-colors block mb-1">
                                  {feature.title}
                                </span>
                                <span className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed block">
                                  {feature.desc}
                                </span>
                              </div>
                            </label>
                            <button
                              onClick={() => {
                                const newFeatures = editingPlan.features.filter((_, i) => i !== idx)
                                setEditingPlan({ ...editingPlan, features: newFeatures })
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0 mt-0.5"
                              title="Hapus Fitur"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Feature */}
                      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-3">
                        <h5 className="text-[13px] font-bold text-blue-900 flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Tambah Fitur Kustom
                        </h5>
                        <input
                          type="text"
                          value={newFeatureTitle}
                          onChange={(e) => setNewFeatureTitle(e.target.value)}
                          placeholder="Nama Fitur (cth: Akses API 24/7)"
                          className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-10 text-[13px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all"
                        />
                        <div className="relative">
                          <select
                            value={newFeatureAI}
                            onChange={(e) => setNewFeatureAI(e.target.value)}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 h-10 text-[13px] text-gray-800 dark:text-gray-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-700 focus:outline-none transition-all appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-400">
                              Pilih Model AI (Opsional)
                            </option>
                            <option value="Google Gemini 3.1 Pro">Google Gemini 3.1 Pro</option>
                            <option value="Google Gemini Flash">Google Gemini Flash</option>
                            <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                            <option value="OpenAI GPT-4o mini">OpenAI GPT-4o mini</option>
                            <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                            <option value="Claude 3 Haiku">Claude 3 Haiku</option>
                            <option value="Meta Llama 3.1">Meta Llama 3.1</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-500 dark:text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (newFeatureTitle.trim()) {
                              setEditingPlan({
                                ...editingPlan,
                                features: [
                                  ...(editingPlan.features || []),
                                  {
                                    title: newFeatureTitle,
                                    desc: newFeatureAI
                                      ? `Didukung oleh ${newFeatureAI}`
                                      : 'Kustom Fitur',
                                    isIncluded: true,
                                    icon: <Sparkles className="w-5 h-5 text-gray-700" />,
                                  },
                                ],
                              })
                              setNewFeatureTitle('')
                              setNewFeatureAI('')
                            }
                          }}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[13px] font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" /> Tambahkan Fitur
                        </button>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 border border-amber-100 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-amber-300 bg-white dark:bg-gray-800 group-hover:border-amber-400 transition-colors">
                        <input
                          type="checkbox"
                          checked={editingPlan?.isPopular || false}
                          onChange={(e) =>
                            setEditingPlan({ ...editingPlan, isPopular: e.target.checked })
                          }
                          className="peer opacity-0 absolute inset-0 cursor-pointer"
                        />
                        <Check className="w-3.5 h-3.5 text-amber-600 opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[13px] font-bold text-amber-800 group-hover:text-amber-900 transition-colors">
                        Mark as Popular Plan
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
