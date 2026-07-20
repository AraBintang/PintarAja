import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useDiscountCoupons({ search = '', page = 1, perPage = 10 } = {}) {
  const [coupons, setCoupons] = useState([])
  const [pagination, setPagination] = useState(null)
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

      const res = await request(`/discount-coupons${q}`)

      setCoupons(res.data ?? [])
      setPagination(res.pagination ?? null)
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
    await request('/discount-coupons', {
      method: 'POST',
      body: payload,
    })
    await fetchCoupons()
  }

  const toggleCoupon = async (id) => {
    await request(`/discount-coupons/${id}`, { method: 'DELETE' })
    await fetchCoupons()
  }

  return {
    coupons,
    pagination,
    loading,
    error,
    refetch: fetchCoupons,
    createCoupon,
    toggleCoupon,
  }
}
