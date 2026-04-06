import { FileText } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import WriterForm from '@/components/writer/WriterForm'
import { PromptLibraryModal, SaveWorkbookModal } from '@/components/writer/WriterModals'
import WriterOutput from '@/components/writer/WriterOutput'
import { useAuth } from '@/context/AuthContext'
import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

function buildPrompt({
  topik,
  instruksi,
  paperName,
  sectionName,
  bahasa,
  jumlah,
  panjang,
  files, // FileRef[]
}) {
  const fileNote =
    files.length > 0
      ? `\nReferensi File: Gunakan dokumen-dokumen referensi berikut sebagai sumber utama:\n${files
          .map((f, i) => `${i + 1}. "${f.fileName}"`)
          .join(
            '\n',
          )}\nSertakan kutipan relevan dari dokumen-dokumen tersebut dan tandai dengan format [Sumber: NamaFile] di akhir kalimat yang dikutip.\n`
      : ''

  return `Kamu adalah asisten akademik profesional. Tulis konten karya tulis ilmiah dengan ketentuan berikut:

Jenis Karya: ${paperName}
Bagian: ${sectionName}
Bahasa: ${bahasa}
Jumlah Paragraf: ${jumlah} paragraf
Panjang Maksimal: ${panjang} kata
${fileNote}
Topik / Instruksi Utama:
${topik}
${instruksi ? `\nInstruksi Tambahan:\n${instruksi}` : ''}

Tulis dalam format HTML yang bersih (gunakan tag h1, h2, h3, p, ul, li, blockquote, strong, em). Jangan sertakan tag html, head, atau body. Langsung mulai dari konten.`
}

function buildPromptData({ topik, instruksi, paperName, sectionName, bahasa, jumlah, panjang }) {
  return { topik, instruksi, paperName, sectionName, bahasa, jumlah, panjang }
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

  /* ─── Multi-file state ─── */
  // FileRef: { source: 'saved'|'new', id?, fileId, vectorStoreId, fileName, fileSize }
  const [selectedFiles, setSelectedFiles] = useState([])

  /* ─── UI state ─── */
  const [promptOpen, setPromptOpen] = useState(false)
  const [isGenerated, setIsGenerated] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [citations, setCitations] = useState([])
  const [savedFileInfo, setSavedFileInfo] = useState(null)
  const [inputCollapsed, setInputCollapsed] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')
  const [currentDocId, setCurrentDocId] = useState(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const abortRef = useRef(null)

  /* ─── beforeunload guard ─── */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || selectedFiles.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, selectedFiles])

  const handleEditorUpdate = useCallback(
    (content) => {
      setEditorContent(content)
      if (isGenerated) setHasUnsavedChanges(true)
    },
    [isGenerated],
  )

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

  /* ─── Filter sections ─── */
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
      if (!doc.result) return

      setEditorContent(doc.result)
      setInputCollapsed(true)
      setCurrentDocId(doc.id)
      setIsGenerated(true)
      setHasUnsavedChanges(false)
      setSelectedFiles([])

      try {
        const c = typeof doc.citations === 'string' ? JSON.parse(doc.citations) : doc.citations
        setCitations(c || [])
      } catch {
        setCitations([])
      }

      try {
        const f = typeof doc.fileInfo === 'string' ? JSON.parse(doc.fileInfo) : doc.fileInfo
        setSavedFileInfo(f || null)
      } catch {
        setSavedFileInfo(null)
      }

      if (doc.input) {
        try {
          const parsed = typeof doc.input === 'string' ? JSON.parse(doc.input) : doc.input
          if (parsed.topik !== undefined) setTopik(parsed.topik)
          if (parsed.instruksi !== undefined) setInstruksi(parsed.instruksi || '')
          if (parsed.bahasa) setBahasa(parsed.bahasa)
          if (parsed.jumlah !== undefined) setJumlah(parsed.jumlah)
          if (parsed.panjang !== undefined) setPanjang(parsed.panjang)
          if (parsed.paperName) {
            const mp = papers.find((p) => p.name === parsed.paperName)
            if (mp) setSelectedPaperId(String(mp.id))
          }
          if (parsed.sectionName) {
            setTimeout(() => {
              const ms = allSections.find((s) => s.name === parsed.sectionName)
              if (ms) setSelectedSectionId(String(ms.id))
            }, 0)
          }
        } catch {
          setTopik(doc.title || '')
        }
      } else {
        setTopik(doc.title || '')
      }
    }
    window.addEventListener('loadHistoryWriter', handleLoadDoc)
    return () => window.removeEventListener('loadHistoryWriter', handleLoadDoc)
  }, [papers, allSections])

  const handleReset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort()
    setIsGenerated(false)
    setEditorContent('')
    setInputCollapsed(false)
    setCurrentDocId(null)
    setTopik('')
    setInstruksi('')
    setCitations([])
    setSavedFileInfo(null)
    setHasUnsavedChanges(false)
    setSelectedFiles([])
  }, [])

  useEffect(() => {
    const handleDeleted = (e) => {
      if (e.detail.path !== '/writer') return
      if (e.detail.id === currentDocId) handleReset()
    }
    window.addEventListener('historyItemDeleted', handleDeleted)
    return () => window.removeEventListener('historyItemDeleted', handleDeleted)
  }, [currentDocId, handleReset])

  /* ─── Derived ─── */
  const selectedPaperName = papers.find((p) => String(p.id) === selectedPaperId)?.name || ''
  const selectedSectionName = sections.find((s) => String(s.id) === selectedSectionId)?.name || ''
  const selectedProvider = aiProviders.find((a) => String(a.id) === selectedAiId)
  const isGptProvider = selectedProvider?.code === 'SETTING-GPT'

  /* ─── Generate ─── */
  const handleGenerate = useCallback(
    async (regenerate = false) => {
      if (!topik.trim() || !selectedAiId) return
      if (abortRef.current) abortRef.current.abort()
      abortRef.current = new AbortController()

      setIsGenerating(true)
      const existingContent = editorContent.trim()
      setIsGenerated(false)
      setInputCollapsed(true)
      if (!regenerate) setCurrentDocId(null)

      const fullPrompt = buildPrompt({
        topik,
        instruksi,
        paperName: selectedPaperName,
        sectionName: selectedSectionName,
        bahasa,
        jumlah,
        panjang,
        files: selectedFiles,
      })

      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token') || ''
        // pass all vector store ids
        const body = {
          providerId: parseInt(selectedAiId),
          message: fullPrompt,
          vectorStoreIds: selectedFiles.map((f) => f.vectorStoreId).filter(Boolean),
        }

        const res = await fetch('/api/writers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Generate gagal' }))
          throw new Error(err.message || 'Generate gagal')
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        const separator = existingContent ? '\n\n---\n\n' : ''
        let accumulated = existingContent + separator

        setIsGenerated(true)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })

          if (chunk.includes('<!--CITATIONS:')) {
            const m = chunk.match(/<!--CITATIONS:(.*?)-->/)
            if (m) {
              try {
                const newCitations = JSON.parse(m[1]).map((c) => ({
                  ...c,
                  paper: selectedPaperName,
                  section: selectedSectionName,
                  generatedAt: new Date().toLocaleString('id-ID'),
                }))
                setCitations((prev) => [...prev, ...newCitations])
                // eslint-disable-next-line no-empty, no-unused-vars
              } catch (_) {}
            }
            accumulated += chunk.replace(/<!--CITATIONS:.*?-->/, '')
          } else {
            accumulated += chunk
          }
          setEditorContent(accumulated)
        }

        setHasUnsavedChanges(true)
      } catch (err) {
        if (err.name === 'AbortError') return
        showSnackbar('error', err.message || 'Gagal generate konten')
        setIsGenerated(false)
        setInputCollapsed(false)
        setEditorContent('')
      } finally {
        setIsGenerating(false)
      }
    },
    [
      topik,
      instruksi,
      selectedAiId,
      selectedPaperName,
      selectedSectionName,
      bahasa,
      jumlah,
      panjang,
      selectedFiles,
      showSnackbar,
      editorContent,
    ],
  )

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
        const fullPrompt = buildPrompt({
          ...promptParams,
          files: selectedFiles,
        })

        // Store a summary of files used
        const fileInfoForDb =
          selectedFiles.length > 0
            ? selectedFiles.map((f) => ({ fileName: f.fileName, fileSize: f.fileSize }))
            : savedFileInfo || null

        const saveBody = {
          workbookId: parseInt(targetWorkbookId),
          name: fileName,
          promptData,
          fullPrompt,
          result: editorContent,
          citations: citations?.length > 0 ? citations : null,
          fileInfo: fileInfoForDb,
        }

        if (currentDocId) {
          await request(`/documents/${currentDocId}`, { method: 'PUT', body: saveBody })
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
            body: { userId: user?.M_UserID || user?.id, ...saveBody },
          })
          const docId = res?.id
          if (docId) {
            setCurrentDocId(docId)
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
        setHasUnsavedChanges(false)
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
      selectedFiles,
      savedFileInfo,
      citations,
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
      <div className="min-h-screen bg-[#f7f7f5] dark:bg-[#0f141e] flex flex-col items-center px-6 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto w-full text-center my-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 skeleton rounded-xl" />
            <div className="h-9 w-48 skeleton rounded-xl mt-1" />
          </div>
          <div className="h-4 w-80 skeleton rounded-lg mx-auto mt-3" />
        </div>
        <div className="w-full max-w-3xl">
          <div className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[24px] shadow-sm mb-5 p-6">
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 skeleton rounded-md"
                  style={{ width: `${[100, 83, 67, 100, 75][i]}%` }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
            {['a', 'b', 'c'].map((k) => (
              <div
                key={k}
                className="bg-white/80 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700 rounded-[20px] p-5 shadow-sm"
              >
                <div className="h-3 w-20 skeleton rounded-md mb-3" />
                <div className="h-10 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>
          <div className="h-14 w-full skeleton rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center px-6 overflow-y-auto transition-colors duration-300 overflow-x-hidden">
      <div className="absolute inset-0 z-0 bg-[#f7f7f5] dark:bg-[#0f141e] pointer-events-none" />

      {/* Header */}
      <div className="max-w-[1200px] mx-auto w-full z-10 text-center mt-18 md:my-6">
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

      {/* ── Banners ── */}
      <div className="w-full max-w-3xl z-10 space-y-2 mb-2">
        {hasUnsavedChanges && !saveSuccessMsg && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-full text-amber-700 dark:text-amber-400 text-[13px] font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Ada perubahan yang belum disimpan
            </span>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="text-[12px] font-bold underline underline-offset-2 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
            >
              Simpan sekarang
            </button>
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="flex items-center px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-full text-blue-700 dark:text-blue-400 text-[13px] font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full" />
              {selectedFiles.length} file referensi aktif — hapus sebelum berpindah halaman
            </span>
          </div>
        )}
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
          isGptProvider={isGptProvider}
          selectedFiles={selectedFiles}
          onFilesChange={setSelectedFiles}
        />

        {isGenerating && !isGenerated && (
          <div className="my-4">
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
                  AI sedang menulis
                  {selectedFiles.length > 0
                    ? ` dengan ${selectedFiles.length} referensi file...`
                    : '...'}
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
            onEditorUpdate={handleEditorUpdate}
            isGenerating={isGenerating}
            selectedSectionName={selectedSectionName}
            currentDocId={currentDocId}
            saveSuccessMsg={saveSuccessMsg}
            citations={citations}
            savedFileInfo={savedFileInfo}
            onSave={() => setSaveModalOpen(true)}
            onRegenerate={handleGenerate}
            onReset={handleReset}
            onToggleCollapse={() => setInputCollapsed(true)}
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
