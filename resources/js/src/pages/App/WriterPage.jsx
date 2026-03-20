import { FileText } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import WriterForm from '@/components/writer/WriterForm'
import { PromptLibraryModal, SaveWorkbookModal } from '@/components/writer/WriterModals'
import WriterOutput from '@/components/writer/WriterOutput'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

function buildPrompt({ topik, instruksi, paperName, sectionName, bahasa, jumlah, panjang }) {
  return `Kamu adalah asisten akademik profesional. Tulis konten karya tulis ilmiah dengan ketentuan berikut:

Jenis Karya: ${paperName}
Bagian: ${sectionName}
Bahasa: ${bahasa}
Jumlah Paragraf: ${jumlah} paragraf
Panjang Maksimal: ${panjang} kata

Topik / Instruksi Utama:
${topik}
${instruksi ? `\nInstruksi Tambahan:\n${instruksi}` : ''}

Tulis dalam format HTML yang bersih (gunakan tag h1, h2, h3, p, ul, li, blockquote, strong, em). Jangan sertakan tag html, head, atau body. Langsung mulai dari konten.`
}

function buildPromptData({ topik, instruksi, paperName, sectionName, bahasa, jumlah, panjang }) {
  return {
    topik: topik,
    instruksi: instruksi,
    paperName: paperName,
    sectionName: sectionName,
    bahasa: bahasa,
    jumlah: jumlah,
    panjang: panjang,
  }
}

export default function WriterPage() {
  const { user } = useAuth()
  const { showSnackbar } = useSnackbar()

  /* ─── Master data ─── */
  const [papers, setPapers] = useState([])
  const [allSections, setAllSections] = useState([])
  const [aiProviders, setAiProviders] = useState([])
  const [workbooks, setWorkbooks] = useState([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  /* ─── Form state ─── */
  const [topik, setTopik] = useState('')
  const [instruksi, setInstruksi] = useState('')
  const [selectedPaperId, setSelectedPaperId] = useState('')
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [selectedAiId, setSelectedAiId] = useState('')
  const [bahasa, setBahasa] = useState('Indonesian (Indonesia)')
  const [jumlah, setJumlah] = useState(1)
  const [panjang, setPanjang] = useState(500)

  /* ─── UI state ─── */
  const [promptOpen, setPromptOpen] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [currentDocId, setCurrentDocId] = useState(null)

  const abortRef = useRef(null)

  /* ─── Fetch data ─── */
  useEffect(() => {
    setIsLoadingData(true)
    request('/writers')
      .then((res) => {
        setPapers(res.papers || [])
        setAllSections(res.sections || [])
        setAiProviders(res.ai || [])
        setWorkbooks(res.workbooks || [])
        if (res.papers?.length) setSelectedPaperId(String(res.papers[0].id))
        if (res.ai?.length) setSelectedAiId(String(res.ai[0].id))
      })
      .catch(() => showSnackbar('error', 'Gagal memuat data writer'))
      .finally(() => setIsLoadingData(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ─── Filter sections by paper ─── */
  const sections = allSections.filter((s) => !s.paper_id || String(s.paper_id) === selectedPaperId)

  useEffect(() => {
    if (sections.length > 0) setSelectedSectionId(String(sections[0].id))
    else setSelectedSectionId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPaperId])

  /* ─── Load doc dari sidebar ─── */
  useEffect(() => {
    const handleLoadDoc = (e) => {
      const doc = e.detail
      if (doc.result) {
        setEditorContent(doc.result)
        setInputCollapsed(true)
        setCurrentDocId(doc.id)
        setTopik(doc.title || '')
        setIsGenerated(true)
      }
    }
    window.addEventListener('loadHistoryWriter', handleLoadDoc)
    return () => window.removeEventListener('loadHistoryWriter', handleLoadDoc)
  }, [])

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setIsGenerated(false)
    setEditorContent('')
    setInputCollapsed(false)
    setCurrentDocId(null)
    setTopik('')
    setInstruksi('')
  }, [])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (e.detail.path !== '/writer') return
      if (e.detail.id === currentDocId) {
        handleReset()
      }
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [currentDocId, handleReset])

  /* ─── Derived ─── */
  const selectedPaperName = papers.find((p) => String(p.id) === selectedPaperId)?.name || ''
  const selectedSectionName = sections.find((s) => String(s.id) === selectedSectionId)?.name || ''

  /* ─── Generate ─── */
  const handleGenerate = useCallback(async () => {
    if (!topik.trim() || !selectedAiId) return
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setIsGenerating(true)
    setEditorContent('')
    setIsGenerated(false)
    setCurrentDocId(null)

    const fullPrompt = buildPrompt({
      topik,
      instruksi,
      paperName: selectedPaperName,
      sectionName: selectedSectionName,
      bahasa,
      jumlah,
      panjang,
    })

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''

      const res = await fetch('/api/writers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'text/event-stream',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ providerId: parseInt(selectedAiId), message: fullPrompt }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Generate gagal' }))
        throw new Error(err.message || 'Generate gagal')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      const prefix = editorContent?.trim() ? `${editorContent}\n\n` : ''
      let accumulated = prefix

      setIsGenerated(true)
      setInputCollapsed(true)
      setEditorContent(accumulated)

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setEditorContent(accumulated)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      showSnackbar('error', err.message || 'Gagal generate konten')
      setIsGenerated(false)
      setInputCollapsed(false)
      setEditorContent('')
    } finally {
      setIsGenerating(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    topik,
    instruksi,
    selectedAiId,
    selectedPaperName,
    selectedSectionName,
    bahasa,
    jumlah,
    panjang,
  ])

  /* ─── Save ─── */
  const handleSaveToWorkbook = useCallback(
    async (fileName, targetWorkbookId) => {
      try {
        const promptParams = {
          topik,
          instruksi,
          paperName: selectedPaperName,
          sectionName: selectedSectionName,
          bahasa,
          jumlah,
          panjang,
        }

        const promptData = buildPromptData(promptParams)
        const fullPrompt = buildPrompt(promptParams)

        if (currentDocId) {
          await request(`/documents/${currentDocId}`, {
            method: 'PUT',
            body: {
              workbookId: parseInt(targetWorkbookId),
              name: fileName,
              promptData,
              fullPrompt,
              result: editorContent,
            },
          })

          window.dispatchEvent(
            new CustomEvent('documentSaved', {
              detail: {
                id: currentDocId,
                title: fileName,
                name: fileName,
                workbook: workbooks.find((wb) => String(wb.id) === String(targetWorkbookId))?.name,
                workbook_id: parseInt(targetWorkbookId),
                result: editorContent,
                lastEdited: new Date().toLocaleString('id-ID'),
              },
            }),
          )
        } else {
          const res = await request('/documents', {
            method: 'POST',
            body: {
              userId: user?.M_UserID || user?.id,
              workbookId: parseInt(targetWorkbookId),
              name: fileName,
              promptData,
              fullPrompt,
              result: editorContent,
            },
          })

          const docId = res?.id
          if (docId) {
            setCurrentDocId(docId)
            // Dispatch ke sidebar
            window.dispatchEvent(
              new CustomEvent('documentSaved', {
                detail: {
                  id: docId,
                  title: fileName,
                  name: fileName,
                  workbook: workbooks.find((wb) => String(wb.id) === String(targetWorkbookId))
                    ?.name,
                  workbook_id: parseInt(targetWorkbookId),
                  result: editorContent,
                  lastEdited: new Date().toLocaleString('id-ID'),
                },
              }),
            )
          }
        }

        const wbName = workbooks.find((wb) => String(wb.id) === String(targetWorkbookId))?.name
        setSaveSuccessMsg(`Disimpan ke "${wbName}"`)
        setTimeout(() => setSaveSuccessMsg(''), 4000)
      } catch (err) {
        showSnackbar('error', err.message || 'Gagal menyimpan dokumen')
        throw err
      }
    },
    [
      topik,
      instruksi,
      selectedPaperName,
      selectedSectionName,
      bahasa,
      jumlah,
      panjang,
      currentDocId,
      editorContent,
      workbooks,
      user,
      showSnackbar,
    ],
  )

  const handleAddWorkbook = useCallback(async (name) => {
    try {
      await request('/workbooks', { method: 'POST', body: { name } })
      const res = await request('/writers')
      setWorkbooks(res.workbooks || [])
      showSnackbar('success', `Workbook "${name}" berhasil dibuat`)
    } catch (err) {
      showSnackbar('error', err.message || 'Gagal membuat workbook')
      throw err
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] flex flex-col items-center px-4 overflow-y-auto">
        {/* Header Skeleton */}
        <div className="max-w-[1200px] mx-auto w-full text-center my-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 skeleton rounded-xl" />
            <div className="h-9 w-48 skeleton rounded-xl mt-1" />
          </div>
          <div className="h-4 w-80 skeleton rounded-lg mx-auto mt-3" />
        </div>

        <div className="w-full max-w-3xl">
          {/* Topic Textarea Skeleton */}
          <div className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[24px] shadow-sm mb-5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-3.5 w-36 skeleton rounded-md" />
              <div className="h-7 w-32 skeleton rounded-xl" />
            </div>
            <div className="space-y-2.5">
              <div className="h-4 w-full skeleton rounded-md" />
              <div className="h-4 w-5/6 skeleton rounded-md" />
              <div className="h-4 w-4/6 skeleton rounded-md" />
              <div className="h-4 w-full skeleton rounded-md" />
              <div className="h-4 w-3/4 skeleton rounded-md" />
            </div>
            <div className="flex justify-end mt-4">
              <div className="h-3 w-20 skeleton rounded-md" />
            </div>
          </div>

          {/* Dropdowns Row Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
            {['Jenis Karya', 'Bagian Karya', 'Bahasa'].map((label) => (
              <div
                key={label}
                className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[20px] p-5 shadow-sm"
              >
                <div className="h-3 w-20 skeleton rounded-md mb-3" />
                <div className="h-10 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>

          {/* Instruksi Tambahan Skeleton */}
          <div className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[24px] p-6 mb-5 shadow-sm">
            <div className="h-3 w-40 skeleton rounded-md mb-3" />
            <div className="space-y-2">
              <div className="h-4 w-full skeleton rounded-md" />
              <div className="h-4 w-3/4 skeleton rounded-md" />
            </div>
          </div>

          {/* Toolbar Skeleton */}
          <div className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[20px] p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-36 skeleton rounded-xl" />
              <div className="h-10 w-28 skeleton rounded-xl" />
              <div className="h-10 w-28 skeleton rounded-xl" />
            </div>
          </div>

          {/* Generate Button Skeleton */}
          <div className="h-14 w-full skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center px-4 overflow-y-auto transition-colors duration-300 overflow-x-hidden">
      <div className="absolute inset-0 z-0 bg-[#f7f7f5] dark:bg-[#0f141e] pointer-events-none" />

      {/* Header */}
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center my-6">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            AI Writer
          </h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-[16px] leading-relaxed max-w-xl mx-auto px-4">
          Buat karya tulis ilmiah berkualitas tinggi dengan bantuan AI.
          <span className="hidden sm:inline">
            {' '}
            Pilih jenis karya, bahasa, dan model AI favorit Anda.
          </span>
        </p>
      </div>

      <div className="w-full max-w-3xl relative z-10">
        <WriterForm
          papers={papers}
          sections={sections}
          aiProviders={aiProviders}
          topik={topik}
          instruksi={instruksi}
          selectedPaperId={selectedPaperId}
          selectedSectionId={selectedSectionId}
          selectedAiId={selectedAiId}
          bahasa={bahasa}
          jumlah={jumlah}
          panjang={panjang}
          onTopikChange={setTopik}
          onInstruksiChange={setInstruksi}
          onPaperChange={setSelectedPaperId}
          onSectionChange={setSelectedSectionId}
          onAiChange={setSelectedAiId}
          onBahasaChange={setBahasa}
          onJumlahChange={setJumlah}
          onPanjangChange={setPanjang}
          isGenerated={isGenerated}
          isGenerating={isGenerating}
          inputCollapsed={inputCollapsed}
          onToggleCollapse={() => setInputCollapsed((v) => !v)}
          onGenerate={handleGenerate}
          onPromptLibraryOpen={() => setPromptOpen(true)}
        />

        {/* Skeleton saat streaming belum ada konten */}
        {isGenerating && !editorContent && (
          <div className="mb-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex gap-1.5">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-[#4A90D9] rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
                <span className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                  AI sedang menulis...
                </span>
              </div>
              <div className="p-8 space-y-3 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
              </div>
            </div>
          </div>
        )}

        {isGenerated && (
          <WriterOutput
            editorContent={editorContent}
            onEditorUpdate={setEditorContent}
            isGenerating={isGenerating}
            selectedSectionName={selectedSectionName}
            currentDocId={currentDocId}
            saveSuccessMsg={saveSuccessMsg}
            onSave={() => setSaveModalOpen(true)}
            onRegenerate={handleGenerate}
            onReset={handleReset}
          />
        )}
      </div>

      <PromptLibraryModal
        open={promptOpen}
        onClose={() => setPromptOpen(false)}
        onSelect={setInstruksi}
        papers={papers}
        sections={allSections}
      />

      <SaveWorkbookModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        defaultName={topik.slice(0, 50)}
        onSave={handleSaveToWorkbook}
        workbooks={workbooks}
        onAddWorkbook={handleAddWorkbook}
      />
    </div>
  )
}
