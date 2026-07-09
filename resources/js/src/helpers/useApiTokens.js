import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useApiTokens({ page = 1, perPage = 10 } = {}) {
  const [tokens, setTokens] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const q = buildQuery({ page, limit: perPage })
      const res = await request(`/api-tokens${q}`)
      setTokens(res.data || [])
      setPagination(res)
    } catch (error) {
      console.error('Error fetching API tokens:', error)
    } finally {
      setLoading(false)
    }
  }, [page, perPage])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const createToken = async (payload) => {
    const res = await request('/api-tokens', { method: 'POST', body: payload })
    await fetchTokens()
    return res
  }

  const deleteToken = async (id) => {
    const res = await request(`/api-tokens/${id}`, { method: 'DELETE' })
    await fetchTokens()
    return res
  }

  const searchUsers = async (search) => {
    const q = buildQuery({ search })
    const res = await request(`/api-tokens/users${q}`)
    return res
  }

  return {
    tokens,
    pagination,
    loading,
    createToken,
    deleteToken,
    searchUsers,
    refreshTokens: fetchTokens,
  }
}
