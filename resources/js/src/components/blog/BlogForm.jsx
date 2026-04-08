import { X, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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
  title: '',
  meta_title: '',
  slug: '',
  excerpt: '',
  description: '',
  content: '',
  image: null,
  category: '',
  is_published: false,
  published_at: '',
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

// Map alias keys → Laravel column names for FormData submission
const ALIAS_TO_COLUMN = {
  title: 'M_BlogTitle',
  meta_title: 'M_BlogMetaTitle',
  slug: 'M_BlogSlug',
  excerpt: 'M_BlogExcerpt',
  description: 'M_BlogDescription',
  content: 'M_BlogContent',
  image: 'M_BlogFeaturedImage',
  category: 'M_BlogCategory',
  is_published: 'M_BlogIsPublished',
  published_at: 'M_BlogPublishedAt',
}

export default function BlogForm({ open, onClose, onSubmit, initialData, loading = false }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [imagePreview, setImagePreview] = useState(null)
  // editorKey forces TiptapEditor to fully remount when switching between add/edit
  const editorKey = useRef(0)

  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (open) {
      if (initialData) {
        // Edit mode: populate with aliased data from API
        setFormData({
          title: initialData.title ?? '',
          meta_title: initialData.meta_title ?? '',
          slug: initialData.slug ?? '',
          excerpt: initialData.excerpt ?? '',
          description: initialData.description ?? '',
          // Ensure content is non-empty string so TiptapEditor shows real content
          content:
            initialData.content && initialData.content.trim() !== ''
              ? initialData.content
              : '<p></p>',
          image: null,
          category: initialData.category ?? '',
          is_published: initialData.is_published ?? false,
          published_at: initialData.published_at
            ? new Date(initialData.published_at).toISOString().split('T')[0]
            : '',
        })
        setImagePreview(initialData.image ? `/storage/${initialData.image}` : null)
      } else {
        // Add mode: always start completely blank
        setFormData(EMPTY_FORM)
        setImagePreview(null)
      }
      // Bump key so TiptapEditor remounts fresh with the new content
      editorKey.current += 1
    }
  }, [open, initialData])

  if (!open) return null

  const set = (key) => (e) => setFormData((prev) => ({ ...prev, [key]: e.target?.value ?? e }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFormData((prev) => ({ ...prev, image: file }))
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = () => {
    const submitData = new FormData()

    Object.keys(formData).forEach((key) => {
      const value = formData[key]
      const column = ALIAS_TO_COLUMN[key]
      if (!column) return
      if (value === null || value === '') return

      if (typeof value === 'boolean') {
        submitData.append(column, value ? '1' : '0')
      } else {
        submitData.append(column, value)
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
        <div className="bg-blue-600 dark:bg-orange-500 px-6 py-4 flex items-center justify-between shrink-0">
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
                value={formData.title}
                onChange={set('title')}
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
                  value={formData.slug}
                  onChange={set('slug')}
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
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className={triggerClass}>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Published Date */}
            <div className="space-y-2">
              <label className={labelClass}>Tanggal Publikasi</label>
              <input
                type="date"
                value={formData.published_at}
                onChange={set('published_at')}
                className={inputClass}
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={set('excerpt')}
                placeholder="Ringkasan singkat artikel (opsional)"
                rows={3}
                className={textareaClass}
              />
            </div>

            {/* Meta Title */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>
                Meta Title
                <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                  (untuk SEO — biarkan kosong untuk pakai judul artikel)
                </span>
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={set('meta_title')}
                placeholder="Judul untuk SEO (opsional)"
                className={inputClass}
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>
                Meta Description
                <span className="ml-1.5 text-[11px] font-normal text-gray-400">
                  (maks. 160 karakter)
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={set('description')}
                placeholder="Deskripsi untuk SEO (opsional)"
                rows={2}
                className={textareaClass}
                maxLength={160}
              />
            </div>

            {/* Content — TiptapEditor */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Konten Artikel *</label>
              {/*
                key={editorKey.current} forces a full remount whenever the form
                opens (for both add and edit), so the editor always shows the
                correct content and the placeholder never bleeds through.
              */}
              <TiptapEditor
                key={editorKey.current}
                content={formData.content}
                onUpdate={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                placeholder="Tulis konten artikel di sini..."
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>
                Gambar Featured
                <span className="ml-1.5 text-[11px] font-normal text-gray-400">(maks. 8 MB)</span>
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
              />
              {imagePreview && (
                <div className="mt-2 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData((p) => ({ ...p, image: null }))
                    }}
                    className="text-xs p-1.5 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Published Status */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className={labelClass}>Status Publikasi</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_published"
                    checked={!formData.is_published}
                    onChange={() => setFormData((prev) => ({ ...prev, is_published: false }))}
                    className="w-4 h-4 text-blue-600 dark:text-orange-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Draft</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_published"
                    checked={formData.is_published}
                    onChange={() => setFormData((prev) => ({ ...prev, is_published: true }))}
                    className="w-4 h-4 text-blue-600 dark:text-orange-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Published</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.title || !formData.slug || !formData.content}
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
