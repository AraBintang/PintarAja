import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useCoupons({ search = '', page = 1, perPage = 10 } = {}) {
  const [coupons, setCoupons] = useState([])
  const [plans, setPlans] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    used: 0,
    expired: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCoupons = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
      })

      const res = await request(`/coupons${q}`)

      setCoupons(res.data ?? [])
      setPlans(res.plans ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        active: res.summary?.active ?? 0,
        used: res.summary?.used ?? 0,
        expired: res.summary?.expired ?? 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const createCoupon = async (payload) => {
    await request('/coupons', {
      method: 'POST',
      body: payload,
    })
    await fetchCoupons()
  }

  const deleteCoupon = async (id) => {
    await request(`/coupons/${id}`, { method: 'DELETE' })
    await fetchCoupons()
  }

  return {
    coupons,
    plans,
    pagination,
    summary,
    loading,
    error,
    refetch: fetchCoupons,
    createCoupon,
    deleteCoupon,
  }
}
