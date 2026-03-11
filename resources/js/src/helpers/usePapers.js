import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function usePapers({ search = '', page = 1, perPage = 10 } = {}) {
  const [papers, setPapers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({ total: 0, sections: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPapers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
      })

      const res = await request(`/papers${q}`)

      setPapers(res.data ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        sections: res.summary?.sections ?? 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const createPaper = async (payload) => {
    await request('/papers', {
      method: 'POST',
      body: payload,
    })
    await fetchPapers()
  }

  const updatePaper = async (id, payload) => {
    await request(`/papers/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await fetchPapers()
  }

  const deletePaper = async (id) => {
    await request(`/papers/${id}`, { method: 'DELETE' })
    await fetchPapers()
  }

  return {
    papers,
    pagination,
    summary,
    loading,
    error,
    refetch: fetchPapers,
    createPaper,
    updatePaper,
    deletePaper,
  }
}
