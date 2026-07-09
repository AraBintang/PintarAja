import { useCallback, useEffect, useState } from 'react'

import { request } from '@/utils/Http'

export function useApiTokens({ page = 1, perPage = 10 } = {}) {
  const [tokens, setTokens] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      const res = await request('api-tokens', 'GET', {
        page,
        limit: perPage,
      })
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
    const res = await request('api-tokens', 'POST', payload)
    await fetchTokens()
    return res
  }

  const deleteToken = async (id) => {
    const res = await request(`api-tokens/${id}`, 'DELETE')
    await fetchTokens()
    return res
  }

  const searchUsers = async (search) => {
    const res = await request('api-tokens/users', 'GET', { search })
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
