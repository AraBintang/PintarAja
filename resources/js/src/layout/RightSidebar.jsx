import { Clock, FileText, Hash, MessagesSquare, Mic, Plus, Trash2, Wand2, X } from 'lucide-react'
import React from 'react'
import { useLocation } from 'react-router-dom'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRightSidebar } from '@/context/RightSidebarContext'

/* ─── Mock History Data per Page ─── */
const historyData = {
  '/app/chat': {
    title: 'Riwayat Chat',
    icon: MessagesSquare,
    items: [
      { id: 99, title: 'Pesan Test (Skeleton Demo)', time: 'Baru saja', preview: 'halo' },
      {
        id: 1,
        title: 'Cara membuat proposal skripsi',
        time: '2 menit lalu',
        preview: 'Membuat proposal skripsi yang baik...',
      },
      {
        id: 2,
        title: 'Analisis data kualitatif',
        time: '1 jam lalu',
        preview: 'Metode analisis data kualitatif...',
      },
      {
        id: 3,
        title: 'Review jurnal internasional',
        time: '3 jam lalu',
        preview: 'Membahas cara review jurnal...',
      },
      {
        id: 4,
        title: 'Teknik penulisan abstrak',
        time: 'Kemarin',
        preview: 'Tips menulis abstrak yang efektif...',
      },
      {
        id: 5,
        title: 'Referensi APA Style',
        time: 'Kemarin',
        preview: 'Format penulisan referensi APA...',
      },
    ],
  },
  '/app/new': {
    title: 'Riwayat Chat',
    icon: MessagesSquare,
    items: [
      {
        id: 1,
        title: 'Cara membuat proposal skripsi',
        time: '2 menit lalu',
        preview: 'Membuat proposal skripsi yang baik...',
      },
      {
        id: 2,
        title: 'Analisis data kualitatif',
        time: '1 jam lalu',
        preview: 'Metode analisis data kualitatif...',
      },
      {
        id: 3,
        title: 'Review jurnal internasional',
        time: '3 jam lalu',
        preview: 'Membahas cara review jurnal...',
      },
    ],
  },
  '/app/docs': {
    title: 'Saved Document',
    icon: FileText,
    items: [
      {
        id: 1,
        title: 'Bab 1 - Pendahuluan',
        time: '10 menit lalu',
        preview: 'Latar belakang masalah penelitian...',
      },
      {
        id: 2,
        title: 'Tinjauan Pustaka',
        time: '2 jam lalu',
        preview: 'Kajian teori dan penelitian terdahulu...',
      },
      {
        id: 3,
        title: 'Metodologi Penelitian',
        time: '5 jam lalu',
        preview: 'Metode kuantitatif deskriptif...',
      },
      {
        id: 4,
        title: 'Kesimpulan dan Saran',
        time: 'Kemarin',
        preview: 'Berdasarkan hasil analisis...',
      },
    ],
  },
  '/app/asisten': {
    title: 'Riwayat Humanizer AI',
    icon: Wand2,
    items: [
      {
        id: 1,
        title: 'Humanize teks proposal',
        time: '5 menit lalu',
        preview: 'Teks AI menjadi lebih natural...',
      },
      {
        id: 2,
        title: 'Rewrite abstrak jurnal',
        time: '1 jam lalu',
        preview: 'Mengubah gaya penulisan AI...',
      },
      {
        id: 3,
        title: 'Humanize kesimpulan skripsi',
        time: '3 jam lalu',
        preview: 'Hasil humanize untuk bab 5...',
      },
    ],
  },
  '/app/tanya': {
    title: 'Riwayat Parafrase AI',
    icon: Hash,
    items: [
      {
        id: 1,
        title: 'Parafrase paragraf 1',
        time: '15 menit lalu',
        preview: 'Hasil parafrase dari teks asli...',
      },
      {
        id: 2,
        title: 'Parafrase tinjauan pustaka',
        time: '2 jam lalu',
        preview: 'Versi parafrase dari referensi...',
      },
    ],
  },
  '/app/transkripsi': {
    title: 'Riwayat Transcribe AI',
    icon: Mic,
    items: [
      {
        id: 1,
        title: 'Rekaman kuliah Statistik',
        time: '30 menit lalu',
        preview: 'Transkripsi dari rekaman audio...',
      },
      {
        id: 2,
        title: 'Video YouTube - Machine Learning',
        time: '2 jam lalu',
        preview: 'Transkripsi dari video tutorial...',
      },
      {
        id: 3,
        title: 'Interview penelitian',
        time: 'Kemarin',
        preview: 'Hasil transkripsi wawancara...',
      },
    ],
  },
}

/* ─── Default fallback ─── */
const defaultHistory = {
  title: 'Riwayat',
  icon: Clock,
  items: [],
}

export default function RightSidebar() {
  const { isOpen, close } = useRightSidebar()
  const location = useLocation()
  const [isLoading, setIsLoading] = React.useState(false)
  const currentHistory = historyData[location.pathname] || defaultHistory
  const IconComponent = currentHistory.icon

  // Simulate loading when sidebar opens or pathname changes
  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen, location.pathname])

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/10 z-80 transition-opacity" onClick={close} />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 right-0 h-screen w-[340px] bg-white dark:bg-[#090d16] z-90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <IconComponent className="w-[18px] h-[18px] text-[#4A90D9]" />
            <h2 className="text-[15px] font-semibold text-gray-800 dark:text-gray-200">
              {currentHistory.title}
            </h2>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workbook & Search Area */}
        <div className="flex flex-col border-b border-gray-50 dark:border-gray-800">
          {/* Workbook Dropdown for AI Writer */}
          {location.pathname === '/app/docs' && (
            <div className="px-4 pt-4 pb-1">
              <label className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                Workbook Aktif
              </label>
              <Select defaultValue="default">
                <SelectTrigger className="w-full bg-[#f7f7f5] dark:bg-gray-800 border-transparent focus:border-[#4A90D9]/30 h-[42px] text-[13px] rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium">
                  <SelectValue placeholder="Pilih Workbook" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
                  <SelectGroup className="max-h-[190px] overflow-y-auto pr-1">
                    <SelectItem
                      value="default"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Default Workbook
                    </SelectItem>
                    <SelectItem
                      value="skripsi"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Skripsi Bab 1-3
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                    <SelectItem
                      value="blog"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Artikel Blog
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                    <SelectItem
                      value="tugas"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Tugas Akhir
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                    <SelectItem
                      value="jurnal"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Jurnal Internasional
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                    <SelectItem
                      value="laporan"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Laporan PKL
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                    <SelectItem
                      value="catatan"
                      className="group pr-10 text-[13px] py-2.5 focus:bg-gray-50 dark:focus:bg-gray-700 cursor-pointer"
                    >
                      Catatan Kuliah
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Hapus Workbook"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </SelectItem>
                  </SelectGroup>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-1"></div>
                  <div className="p-1.5 space-y-1">
                    <button
                      className="w-full flex items-center justify-start gap-2 px-2.5 py-2 text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <Plus className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
                      Tambah Workbook Baru
                    </button>
                  </div>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  location.pathname === '/app/docs' ? 'Cari dokumen...' : 'Cari riwayat...'
                }
                className="w-full bg-[#f7f7f5] dark:bg-gray-800 text-[13px] text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#4A90D9]/20 focus:bg-white dark:focus:bg-gray-700 border border-transparent focus:border-[#4A90D9]/30 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* History Items */}
        <div className="flex-1 overflow-y-auto py-2">
          {isLoading ? (
            <div className="px-4 space-y-4 pt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-4 w-3/4 skeleton opacity-60" />
                    <div className="h-3 w-12 skeleton opacity-40" />
                  </div>
                  <div className="h-3 w-full skeleton opacity-30" />
                </div>
              ))}
            </div>
          ) : currentHistory.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
              <Clock className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">
                Belum ada riwayat
              </p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1 text-center">
                Riwayat akan muncul setelah Anda mulai menggunakan fitur ini
              </p>
            </div>
          ) : (
            currentHistory.items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (location.pathname === '/app/chat' && item.id === 99) {
                    // Dispatch custom event to trigger history load in ChatPage
                    window.dispatchEvent(
                      new CustomEvent('loadHistoryChat', { detail: { id: item.id } }),
                    )
                    close() // Close sidebar on mobile
                  }
                }}
                className="w-full text-left px-4 py-3 hover:bg-[#f7f7f5] dark:hover:bg-gray-800 transition-colors group border-b border-gray-50 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#4A90D9] transition-colors truncate flex-1">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0 mt-0.5">
                    {item.time}
                  </span>
                </div>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {item.preview}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
          <button className="w-full text-[13px] text-[#4A90D9] font-medium py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
            Lihat Semua Riwayat
          </button>
        </div>
      </aside>
    </>
  )
}
