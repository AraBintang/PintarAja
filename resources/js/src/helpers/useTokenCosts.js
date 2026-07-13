import { useState, useCallback, useEffect } from 'react'
import { request } from '@/utils/Http'

export function useTokenCosts() {
  const [costs, setCosts] = useState({
    cost_chat: 1,
    cost_image_generator: 5,
    cost_video_generator: 10,
    cost_writer: 2,
    cost_humanizer: 3,
    cost_paraphrase: 2,
    cost_transcribe: 5,
    cost_topup_amount: 100,
    cost_topup_price: 10000,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchCosts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await request('/token-costs', { method: 'GET' })
      if (data) {
        setCosts(data)
      }
    } catch (err) {
      console.error('Error fetching token costs:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCosts = async (payload) => {
    setSaving(true)
    try {
      const { data } = await request('/token-costs', { method: 'POST', body: payload })
      if (data) {
        setCosts(data)
      }
      return true
    } catch (err) {
      console.error('Error updating token costs:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchCosts()
  }, [fetchCosts])

  return { costs, loading, saving, updateCosts, refresh: fetchCosts }
}
