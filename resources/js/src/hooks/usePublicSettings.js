import { useEffect, useState } from 'react'

import { requestGuest } from '@/utils/Http'

let cache = null

export function usePublicSettings() {
  const [settings, setSettings] = useState(cache ?? {})
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) return
    const fetch = async () => {
      try {
        const res = await requestGuest('/settings/public')
        cache = res
        setSettings(res)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { settings, loading }
}
