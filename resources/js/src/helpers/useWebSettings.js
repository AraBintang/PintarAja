import { useCallback, useEffect, useState } from 'react'

import { request } from '@/utils/Http'

export function useWebSettings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await request('/web-settings')
      setSettings(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  const createSetting = async (payload) => {
    const res = await request('/web-settings', { method: 'POST', body: payload })
    setSettings((prev) => [...prev, res.data])
  }

  const updateSetting = async (id, payload) => {
    const res = await request(`/web-settings/${id}`, { method: 'PUT', body: payload })
    setSettings((prev) => prev.map((s) => (s.id === id ? res.data : s)))
  }

  const deleteSetting = async (id) => {
    await request(`/web-settings/${id}`, { method: 'DELETE' })
    setSettings((prev) => prev.filter((s) => s.id !== id))
  }

  return { settings, loading, createSetting, updateSetting, deleteSetting, refetch: fetch }
}
