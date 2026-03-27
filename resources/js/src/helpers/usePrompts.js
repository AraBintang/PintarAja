import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function usePrompts({
  search = '',
  filterPaper = '',
  filterSection = '',
  page = 1,
  perPage = 10,
} = {}) {
  const [prompts, setPrompts] = useState([])
  const [papers, setPapers] = useState([])
  const [sections, setSections] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({ total: 0, papers: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrompts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
        ...(filterPaper && { paperId: filterPaper }),
        ...(filterSection && { sectionId: filterSection }),
      })

      const res = await request(`/prompts${q}`)

      setPrompts(res.data ?? [])
      setPapers(res.papers ?? [])
      setSections(res.sections ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        papers: res.summary?.papers ?? 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, filterPaper, filterSection, page, perPage])

  useEffect(() => {
    fetchPrompts()
  }, [fetchPrompts])

  const createPrompt = async (payload) => {
    await request('/prompts', {
      method: 'POST',
      body: payload,
    })
    await fetchPrompts()
  }

  const updatePrompt = async (id, payload) => {
    await request(`/prompts/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await fetchPrompts()
  }

  const deletePrompt = async (id) => {
    await request(`/prompts/${id}`, { method: 'DELETE' })
    await fetchPrompts()
  }

  return {
    prompts,
    papers,
    sections,
    pagination,
    summary,
    loading,
    error,
    refetch: fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
  }
}
