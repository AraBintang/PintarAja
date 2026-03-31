import {
  BookMarked,
  Check,
  Copy,
  Download,
  FileDown,
  FileText,
  FolderPlus,
  RotateCw,
} from 'lucide-react'
import { memo, useMemo, useState } from 'react'

import TiptapEditor from '@/components/TiptapEditor'
import { useSnackbar } from '@/context/SnackbarContext'

const WriterOutput = memo(function WriterOutput({
  editorContent,
  onEditorUpdate,
  isGenerating,
  selectedSectionName,
  currentDocId,
  saveSuccessMsg,
  citations,
  savedFileInfo,
  onSave,
  onRegenerate,
  onReset,
}) {
  const { showSnackbar } = useSnackbar()
  const [copied, setCopied] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)

  const handleCopy = () => {
    const temp = document.createElement('div')
    temp.innerHTML = editorContent
    navigator.clipboard.writeText(temp.textContent || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = useMemo(() => {
    const temp = document.createElement('div')
    temp.innerHTML = editorContent
    return temp.textContent?.trim().split(/\s+/).filter(Boolean).length || 0
  }, [editorContent])

  const handleDownloadDoc = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
      const res = await fetch('/api/documents/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editorContent }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error downloading document!')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Document.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setDownloadOpen(false)
      showSnackbar('success', 'Document downloaded successfully!')
    } catch (err) {
      showSnackbar('error', err.message)
    }
  }

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(
      `<html><head><style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.8;margin:2.54cm;color:#1f2937;}h1{font-size:18pt;font-weight:bold;}h2{font-size:15pt;font-weight:bold;}h3{font-size:13pt;font-weight:bold;}blockquote{border-left:3px solid #888;padding-left:12px;color:#555;font-style:italic;}ul{list-style:disc;padding-left:24pt;}@media print{body{margin:0;}}</style></head><body>${editorContent}</body></html>`,
    )
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
    setDownloadOpen(false)
  }

  const hasCitations = citations?.length > 0
  const hasSavedFile = !!savedFileInfo?.fileName
  const showRefPanel = hasCitations || hasSavedFile

  return (
    <div className="mb-8">
      {/* ── Action Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 px-1 md:px-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] md:text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Result
          </span>
          {selectedSectionName && (
            <span className="text-[10px] md:text-[11px] font-medium text-[#4A90D9] bg-[#4A90D9]/10 px-2 py-0.5 rounded-md">
              {selectedSectionName}
            </span>
          )}
          {currentDocId && (
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md">
              Saved
            </span>
          )}
          {saveSuccessMsg && (
            <span className="text-[11px] md:text-[12px] font-medium text-green-600 dark:text-green-400 animate-pulse bg-green-50 dark:bg-green-900/20 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full whitespace-nowrap">
              ✓ {saveSuccessMsg}
            </span>
          )}
          {showRefPanel && (
            <span className="text-[10px] font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
              <BookMarked className="w-3 h-3" />
              {hasCitations ? `${citations.length} Referensi` : `Dari: ${savedFileInfo.fileName}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-[12px] md:text-[13px] font-bold text-white rounded-xl shadow-md transition-colors whitespace-nowrap bg-gradient-to-r from-[#4A90D9] to-blue-500 hover:from-[#3f86cc] hover:to-[#2f6fb8] dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-400 dark:hover:to-orange-500"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{currentDocId ? 'Update Doc' : 'Save Doc'}</span>
            <span className="sm:hidden">Save</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center px-3 py-1.5 md:px-3 md:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-[10px] md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setDownloadOpen(!downloadOpen)}
              className="flex items-center justify-center px-3 py-1.5 md:px-3 md:py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-[10px] md:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            {downloadOpen && (
              <>
                <div className="fixed inset-0 z-90" onClick={() => setDownloadOpen(false)} />
                <div className="fixed mt-2 -ml-16 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-90 min-w-[160px] py-1.5 overflow-visible">
                  <button
                    onClick={handleDownloadDoc}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="font-medium block">Word (.doc)</span>
                      <span className="text-[11px] text-gray-400">Microsoft Word Document</span>
                    </div>
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2.5"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                    <div>
                      <span className="font-medium block">PDF (.pdf)</span>
                      <span className="text-[11px] text-gray-400">Print to PDF</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 md:px-3 md:py-2 text-[12px] font-medium rounded-xl shadow-sm transition-colors disabled:opacity-50 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <TiptapEditor
        content={editorContent}
        onUpdate={onEditorUpdate}
        placeholder="AI ​​results will appear here. You can edit them directly...."
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[12px] text-gray-400 dark:text-gray-500">{wordCount} Word</span>
        <button
          onClick={onReset}
          className="text-[12px] font-medium text-gray-400 hover:text-red-500 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* ── Referensi Panel ── */}
      {showRefPanel && (
        <div className="mt-4">
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-700/30 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-purple-100 dark:border-purple-700/20 bg-purple-100/50 dark:bg-purple-900/10">
              <BookMarked className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
              <h3 className="text-[13px] font-semibold text-purple-700 dark:text-purple-300">
                Referensi File yang Digunakan
              </h3>
              {hasCitations && (
                <span className="ml-auto text-[11px] font-medium text-purple-500 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/30 px-2 py-0.5 rounded-full">
                  {citations.length} sumber
                </span>
              )}
            </div>

            {/* ── Daftar citasi dengan paper & section ── */}
            {hasCitations && (
              <div className="divide-y divide-purple-100 dark:divide-purple-700/20">
                {citations.map((cite, idx) => (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3">
                    {/* Nomor urut */}
                    <div className="w-5 h-5 bg-purple-200 dark:bg-purple-700/40 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Nama file */}
                      <p className="text-[13px] font-semibold text-purple-800 dark:text-purple-200 truncate">
                        {cite.filename || 'File Referensi'}
                      </p>

                      {/* Metadata baris kedua: paper, section, index, waktu */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {cite.paper && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/20 px-1.5 py-0.5 rounded font-medium">
                            {cite.paper}
                          </span>
                        )}
                        {cite.section && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800/20 px-1.5 py-0.5 rounded font-medium">
                            {cite.section}
                          </span>
                        )}
                        {cite.index != null && (
                          <span className="text-[10px] text-purple-400 dark:text-purple-500">
                            karakter ke-{cite.index.toLocaleString('id-ID')}
                          </span>
                        )}
                        {cite.generatedAt && (
                          <span className="text-[10px] text-purple-300 dark:text-purple-600 ml-auto whitespace-nowrap">
                            {cite.generatedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            {/* <div className="px-4 py-2.5 bg-purple-100/50 dark:bg-purple-900/10 border-t border-purple-100 dark:border-purple-700/20">
              <p className="text-[11px] text-purple-500 dark:text-purple-400">
                Tanda{' '}
                <code className="bg-purple-200/60 dark:bg-purple-700/20 px-1 rounded text-[10px]">
                  [Sumber: nama_file]
                </code>{' '}
                dalam teks menunjukkan kutipan dari file referensi yang diunggah.
              </p>
            </div> */}
          </div>
        </div>
      )}
    </div>
  )
})

export default WriterOutput
