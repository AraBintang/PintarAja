import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useUsers({
  search = '',
  role = '',
  plan = '',
  status = '',
  page = 1,
  perPage = 10,
} = {}) {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    admin: 0,
    premium: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
        ...(role && { role }),
        ...(plan && { plan }),
        ...(status && { status }),
      })

      const res = await request(`/users${q}`)
      setUsers(res.data ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        active: res.summary?.active ?? 0,
        admin: res.summary?.admin ?? 0,
        premium: res.summary?.premium ?? 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, role, plan, status, page, perPage])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = async (payload) => {
    await request('/users', {
      method: 'POST',
      body: payload,
    })
    await fetchUsers()
  }

  const updateUser = async (id, payload) => {
    await request(`/users/${id}`, {
      method: 'PUT',
      body: payload,
    })
    await fetchUsers()
  }

  const deleteUser = async (id) => {
    await request(`/users/${id}`, { method: 'DELETE' })
    await fetchUsers()
  }

  return {
    users,
    pagination,
    summary,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
