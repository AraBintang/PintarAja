import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function usePlans({ search = '', page = 1, perPage = 10 } = {}) {
  const [plans, setPlans] = useState([])
  const [aiList, setAiList] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
      })

      const res = await request(`/plans${q}`)

      setPlans(res.data ?? [])
      setAiList(res.ai ?? [])
      setPagination(res.pagination ?? null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const createPlan = async (payload) => {
    await request('/plans', {
      method: 'POST',
      body: payload,
    })
    await fetchPlans()
  }

  const updatePlan = async (id, payload) => {
    await request(`/plans/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await fetchPlans()
  }

  const deletePlan = async (id) => {
    await request(`/plans/${id}`, { method: 'DELETE' })
    await fetchPlans()
  }

  return {
    plans,
    aiList,
    pagination,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  }
}
