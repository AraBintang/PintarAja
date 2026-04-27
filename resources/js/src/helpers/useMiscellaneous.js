import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useMiscellaneous({ from, to } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMisc = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        ...(from && { from }),
        ...(to && { to }),
      })
      const res = await request(`/miscellaneous${q}`)
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    fetchMisc()
  }, [fetchMisc])

  return {
    data,
    loading,
    error,
    refetch: fetchMisc,
  }
}
