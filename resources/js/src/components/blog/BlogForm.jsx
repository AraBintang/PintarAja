import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import TiptapEditor from '@/components/TiptapEditor'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const EMPTY_FORM = {
  M_BlogTitle: '',
  M_BlogSlug: '',
  M_BlogExcerpt: '',
  M_BlogDescription: '',
  M_BlogContent: '',
  M_BlogFeaturedImage: null,
  M_BlogCategory: '',
  M_BlogIsPublished: false,
  M_BlogPublishedAt: '',
}

const CATEGORIES = [
  'AI',
  'Tutorial',
  'News',
  'Technology',
  'Business',
  'Lifestyle',
  'Education',
  'Entertainment',
]

export default function BlogForm({ open, onClose, onSubmit, initialData, loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState(null)

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (initialData) {
      setFormData({
        M_BlogTitle: initialData.M_BlogTitle ?? '',
        M_BlogSlug: initialData.M_BlogSlug ?? '',
        M_BlogExcerpt: initialData.M_BlogExcerpt ?? '',
        M_BlogDescription: initialData.M_BlogDescription ?? '',
        M_BlogContent: initialData.M_BlogContent ?? '',
        M_BlogFeaturedImage: null,
        M_BlogCategory: initialData.M_BlogCategory ?? '',
        M_BlogIsPublished: initialData.M_BlogIsPublished ?? false,
        M_BlogPublishedAt: initialData.M_BlogPublishedAt
          ? new Date(initialData.M_BlogPublishedAt).toISOString().split('T')[0]
          : '',
      })
      if (initialData.M_BlogFeaturedImage) {
        setImagePreview(`/storage/${initialData.M_BlogFeaturedImage}`)
      }
    } else {
      setFormData(EMPTY_FORM)
      setImagePreview(null)
    }
  }, [initialData])

  if (!open) return null

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, M_BlogFeaturedImage: file }))
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const generateSlug = () => {
    const slug = formData.M_BlogTitle.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData((prev) => ({ ...prev, M_BlogSlug: slug }))
  }

  const handleSubmit = () => {
    const submitData = new FormData()

    Object.keys(formData).forEach((key) => {
      const value = formData[key]

      if (value === null || value === '') return

      if (typeof value === 'boolean') {
        submitData.append(key, value ? '1' : '0')
      } else {
        submitData.append(key, value)
      }
    })

    onSubmit(submitData)
  }

  const inputClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 h-11 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors'

  const textareaClass =
    'w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-[14px] text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 hover:border-gray-300 dark:hover:border-gray-500 focus:border-blue-400 dark:focus:border-orange-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-orange-900/30 focus:bg-white dark:focus:bg-gray-800 focus:outline-none transition-colors resize-vertical'

  const labelClass = 'text-[13px] font-semibold text-gray-600 dark:text-gray-300 block'

  const triggerClass =
    'w-full bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl text-[14px] h-11 focus:ring-0 focus:border-blue-400 dark:focus:border-orange-400 focus:bg-white dark:focus:bg-gray-800 transition-colors'

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between">
          <h3 className="text-white font-bold text-lg tracking-wide">
            {isEdit ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Judul Artikel *</label>
              <input
                type="text"
                value={formData.M_BlogTitle}
                onChange={set('M_BlogTitle')}
                placeholder="Masukkan judul artikel"
                className={inputClass}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Slug *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.M_BlogSlug}
                  onChange={set('M_BlogSlug')}
                  placeholder="url-friendly-slug"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  Generate
                </button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className={labelClass}>Kategori *</label>
              <Select
                value={formData.M_BlogCategory}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, M_BlogCategory: value }))
                }
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Excerpt */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Excerpt</label>
              <textarea
                value={formData.M_BlogExcerpt}
                onChange={set('M_BlogExcerpt')}
                placeholder="Ringkasan singkat artikel (opsional)"
                rows={3}
                className={textareaClass}
              />
            </div>

            {/* Description */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Meta Description</label>
              <textarea
                value={formData.M_BlogDescription}
                onChange={set('M_BlogDescription')}
                placeholder="Deskripsi untuk SEO (opsional)"
                rows={2}
                className={textareaClass}
              />
            </div>

            {/* Content — TiptapEditor */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Konten Artikel *</label>
              <TiptapEditor
                content={formData.M_BlogContent}
                onUpdate={(html) => setFormData((prev) => ({ ...prev, M_BlogContent: html }))}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Gambar Featured</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            {/* Published Status */}
            <div className="space-y-2">
              <label className={labelClass}>Status Publikasi</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="published"
                    checked={!formData.M_BlogIsPublished}
                    onChange={() => setFormData((prev) => ({ ...prev, M_BlogIsPublished: false }))}
                    className="w-4 h-4 text-blue-600 dark:text-orange-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="published"
                    checked={formData.M_BlogIsPublished}
                    onChange={() => setFormData((prev) => ({ ...prev, M_BlogIsPublished: true }))}
                    className="w-4 h-4 text-blue-600 dark:text-orange-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
                </label>
              </div>
            </div>

            {/* Published Date */}
            <div className="space-y-2">
              <label className={labelClass}>Tanggal Publikasi</label>
              <input
                type="date"
                value={formData.M_BlogPublishedAt}
                onChange={set('M_BlogPublishedAt')}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading || !formData.M_BlogTitle || !formData.M_BlogSlug || !formData.M_BlogContent
            }
            className="px-6 py-2 bg-blue-600 dark:bg-orange-500 hover:bg-blue-700 dark:hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {isEdit ? 'Update Artikel' : 'Simpan Artikel'}
          </button>
        </div>
      </div>
    </div>
  )
}
