import { Save, Coins } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useSnackbar } from '@/context/SnackbarContext'
import { useTokenCosts } from '@/helpers/useTokenCosts'

export default function TokenCostPage() {
  const { showSnackbar } = useSnackbar()
  const { costs, loading, saving, updateCosts } = useTokenCosts()
  const [formData, setFormData] = useState({})

  useEffect(() => {
    if (!loading) {
      setFormData(costs)
    }
  }, [costs, loading])

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value === '' ? 0 : parseInt(value, 10)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateCosts(formData)
      showSnackbar('success', 'Harga token berhasil diperbarui')
    } catch (err) {
      showSnackbar('error', 'Gagal memperbarui harga token')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const fields = [
    { key: 'cost_chat', label: 'AI Chat', desc: 'Biaya token untuk 1x interaksi chat' },
    { key: 'cost_image_generator', label: 'Image Generator', desc: 'Biaya token untuk membuat 1 gambar' },
    { key: 'cost_video_generator', label: 'Video Generator', desc: 'Biaya token untuk membuat 1 video' },
    { key: 'cost_writer', label: 'AI Writer', desc: 'Biaya token untuk generate artikel/teks' },
    { key: 'cost_humanizer', label: 'Humanizer', desc: 'Biaya token untuk fitur anti-deteksi AI' },
    { key: 'cost_paraphrase', label: 'Paraphrase', desc: 'Biaya token untuk parafrase teks' },
    { key: 'cost_transcribe', label: 'Transcribe', desc: 'Biaya token untuk konversi audio/video ke teks' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Coins className="h-6 w-6 text-indigo-500" />
          Pengaturan Harga Token (Token Costs)
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Atur berapa banyak kuota/koin pengguna yang akan dipotong setiap kali mereka menggunakan fitur AI.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <label htmlFor={field.key} className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    id={field.key}
                    type="number"
                    min="0"
                    value={formData[field.key] ?? 0}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="pl-10 h-11 w-full border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg bg-slate-50 dark:bg-slate-900/50"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Coins className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {field.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
