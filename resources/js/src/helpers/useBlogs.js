import { useCallback, useEffect, useState } from 'react'

import { buildQuery, request } from '@/utils/Http'

export function useBlogs({ search = '', category = '', status = '', page = 1, perPage = 10 } = {}) {
  const [blogs, setBlogs] = useState([])
  const [pagination, setPagination] = useState(null)
  const [summary, setSummary] = useState({
    total: 0,
    published: 0,
    draft: 0,
    views: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const q = buildQuery({
        per_page: perPage,
        page,
        ...(search && { search }),
        ...(category && { category }),
        ...(status && { status }),
      })

      const res = await request(`/blogs${q}`)
      setBlogs(res.data ?? [])
      setPagination(res.pagination ?? null)
      setSummary({
        total: res.summary?.total ?? 0,
        published: res.summary?.published ?? 0,
        draft: res.summary?.draft ?? 0,
        views: res.summary?.views ?? 0,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, category, status, page, perPage])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  const createBlog = async (payload) => {
    await request('/blogs', {
      method: 'POST',
      body: payload,
      headers: {}, // Let browser set Content-Type for FormData
    })
    await fetchBlogs()
  }

  const updateBlog = async (id, payload) => {
    await request(`/blogs/${id}`, {
      method: 'POST',
      body: payload,
      headers: {
        'X-HTTP-Method-Override': 'PUT', // For Laravel to recognize as PUT
      },
    })
    await fetchBlogs()
  }

  const deleteBlog = async (id) => {
    await request(`/blogs/${id}`, { method: 'DELETE' })
    await fetchBlogs()
  }

  return {
    blogs,
    pagination,
    summary,
    loading,
    error,
    refetch: fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
  }
}
