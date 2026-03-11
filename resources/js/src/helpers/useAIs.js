import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useAIs({ search = '', page = 1, perPage = 10 } = {}) {
  const [aiKeys, setAiKeys] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({ total: 0, active: 0 })
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAiKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
      })

      const res = await request(`/settings${q}`)

      setAiKeys(res.data ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        active: res.summary?.active ?? 0,
      })
      setPlans(res.plans ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    fetchAiKeys()
  }, [fetchAiKeys])

  const createAiKey = async (payload) => {
    await request('/settings', {
      method: 'POST',
      body: payload,
    })
    await fetchAiKeys()
  }

  const updateAiKey = async (id, payload) => {
    await request(`/settings/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await fetchAiKeys()
  }

  const activateAiKey = async (id) => {
    await request(`/settings/activate/${id}`, { method: 'PUT' })
    await fetchAiKeys()
  }

  const deactivateAiKey = async (id) => {
    await request(`/settings/deactivate/${id}`, { method: 'PUT' })
    await fetchAiKeys()
  }

  const deleteAiKey = async (id) => {
    await request(`/settings/${id}`, { method: 'DELETE' })
    await fetchAiKeys()
  }

  return {
    aiKeys,
    pagination,
    summary,
    plans,
    loading,
    error,
    refetch: fetchAiKeys,
    createAiKey,
    updateAiKey,
    activateAiKey,
    deactivateAiKey,
    deleteAiKey,
  }
}
