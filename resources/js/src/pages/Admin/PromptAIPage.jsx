import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Filter,
  Plus,
  Search,
  Sparkles,
  Terminal,
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

const MOCK_PROMPTS = [
  {
    id: 1,
    name: 'Ringkasan Laporan Keuangan',
    paper: 'Bisnis',
    section: 'Akuntan',
    text: 'Buatkan ringkasan laporan keuangan bulan Maret 2026 dengan format yang mudah dipahami oleh manajemen.',
  },
  {
    id: 2,
    name: 'Pelaporan Pajak',
    paper: 'Bisnis',
    section: 'Akuntan',
    text: 'Sebutkan semua dokumen yang dibutuhkan untuk pelaporan pajak tahunan perusahaan.',
  },
  {
    id: 3,
    name: 'Budgeting Perusahaan',
    paper: 'Bisnis',
    section: 'Akuntan',
    text: 'Buatkan estimasi anggaran untuk triwulan kedua tahun 2026 berdasarkan data historis.',
  },
  {
    id: 4,
    name: 'Pertanyaan ujian Sidang',
    paper: 'Pendidikan',
    section: 'Dosen',
    text: 'Buatkan Pertanyaan ujian sidang baik metode penelitian kuantitatif maupun kualitatif.',
  },
  {
    id: 5,
    name: 'Membuat Jadwal Bimbingan dan Jadwal Belajar',
    paper: 'Pendidikan',
    section: 'Dosen',
    text: 'Saya ingin Anda membuat jadwal belajar dengan tanggal dan waktu yang terstruktur.',
  },
  {
    id: 6,
    name: 'Analisis Data',
    paper: 'Pendidikan',
    section: 'Dosen',
    text: 'Jika saya memiliki data-data berikut ini : [DATA] analisis menggunakan metode statistik.',
  },
  {
    id: 7,
    name: 'Memperbaiki Tulisan Penelitian',
    paper: 'Pendidikan',
    section: 'Dosen',
    text: 'Revisi kalimat ini guna menggabungkan kosakata formal dan akademik yang sesuai.',
  },
  {
    id: 8,
    name: 'Konsultasi Penelitian',
    paper: 'Pendidikan',
    section: 'Professor',
    text: 'Anda berperan sebagai Dosbing, anda adalah Profesor bidang ilmu komputer.',
  },
  {
    id: 9,
    name: 'Parafrase Cepat',
    paper: 'Pendidikan',
    section: 'Dosen',
    text: 'Bantu aku untuk parafrase teks berikut ini agar tidak terdeteksi plagiarisme.',
  },
  {
    id: 10,
    name: 'Buat Abstrak Skripsi',
    paper: 'Pendidikan',
    section: 'Mahasiswa',
    text: 'Buatkan abstrak skripsi tentang topik berikut ini dengan gaya akademik formal.',
  },
]

/* ─── Paper color map ─── */
function getPaperStyle(paper) {
  switch (paper) {
    case 'Bisnis':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: '💼' }
    case 'Pendidikan':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: '🎓' }
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-700',
        text: 'text-gray-600 dark:text-gray-300',
        border: 'border-gray-100 dark:border-gray-700',
        icon: '📋',
      }
  }
}

export default function PromptAIPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const totalPrompts = MOCK_PROMPTS.length
  const papersCount = [...new Set(MOCK_PROMPTS.map((p) => p.paper))].length

  const stats = [
    {
      label: 'Total Prompt',
      value: totalPrompts,
      icon: Terminal,
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Paper',
      value: papersCount,
      icon: BookOpen,
      bgLight: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Template',
      value: totalPrompts,
      icon: Sparkles,
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <div className="flex-1 h-full bg-[#f7f7f5] dark:bg-[#0f141e] overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-4 sm:py-6">
      <div className="max-w-[1200px] mx-auto overflow-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none shrink-0">
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              System Prompt AI
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[12px] sm:text-sm mt-1 sm:ml-[46px]">
              Kelola instruksi sistem dan behavior model AI
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:hover:shadow-none transition-all hover:-translate-y-0.5 text-[14px] w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Prompt
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6 w-full">
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
                placeholder="Cari prompt..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-medium rounded-xl border transition-all w-full sm:w-auto ${
                showFilters
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
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
                  <SelectValue placeholder="Semua Paper" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="bisnis">Bisnis</SelectItem>
                    <SelectItem value="pendidikan">Pendidikan</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 rounded-xl text-[13px] focus:ring-0">
                  <SelectValue placeholder="Semua Section Paper" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectGroup>
                    <SelectItem value="akuntan">Akuntan</SelectItem>
                    <SelectItem value="dosen">Dosen</SelectItem>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
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
                    Prompt Information
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Instructions
                  </th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                {MOCK_PROMPTS.map((prompt, index) => {
                  const paperStyle = getPaperStyle(prompt.paper)
                  const isExpanded = expandedRow === prompt.id
                  return (
                    <tr
                      key={prompt.id}
                      className="hover:bg-indigo-50/20 transition-colors group cursor-pointer"
                      onClick={() => setExpandedRow(isExpanded ? null : prompt.id)}
                    >
                      <td className="px-6 py-3.5 text-[13px] text-gray-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[14px] font-semibold text-gray-800 dark:text-gray-100">
                          {prompt.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border ${paperStyle.bg} ${paperStyle.text} ${paperStyle.border}`}
                        >
                          <span>{paperStyle.icon}</span>
                          {prompt.paper} » {prompt.section}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed max-w-[500px] line-clamp-3">
                          {prompt.text}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1.5 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            title="Preview"
                            className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Edit"
                            className="w-8 h-8 rounded-lg bg-violet-50 hover:bg-violet-100 flex items-center justify-center text-violet-600 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Hapus"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              Menampilkan{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">1-10</span> dari{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-100">10</span> prompt
            </p>
            <div className="flex items-center gap-1.5">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-[13px] shadow-sm shadow-blue-200 dark:shadow-none">
                1
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Prompt Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg tracking-wide uppercase">
                Input Data Prompt
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nama atau Judul */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Prompt Title
                  </label>
                  <input
                    type="text"
                    // value={formData.title} // Assuming formData and setFormData exist
                    // onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Akademik Writer"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all"
                  />
                </div>
                {/* Paper */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Paper
                  </label>
                  <Select>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 transition-all">
                      <SelectValue placeholder="Pilih Paper" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="bisnis">Bisnis</SelectItem>
                        <SelectItem value="pendidikan">Pendidikan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                {/* Section Paper */}
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                    Section Paper
                  </label>
                  <Select>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 transition-all">
                      <SelectValue placeholder="Pilih Section Paper" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectGroup>
                        <SelectItem value="akuntan">Akuntan</SelectItem>
                        <SelectItem value="dosen">Dosen</SelectItem>
                        <SelectItem value="mahasiswa">Mahasiswa</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Text prompt */}
              <div className="space-y-2 pt-2">
                <label className="text-[13px] font-semibold text-gray-600 dark:text-gray-300 block">
                  Text prompt
                </label>
                <textarea
                  placeholder="Tulis prompt di sini..."
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-4 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-all resize-y"
                ></textarea>
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
                /* onClick={handleSave} */ className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow-md hover:shadow-blue-200 dark:hover:shadow-none transition-all uppercase tracking-wide"
              >
                Simpan Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
