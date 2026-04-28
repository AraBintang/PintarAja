// hooks/useQuota.js
import { useCallback, useState } from 'react'

export function useQuota(initialQuota = {}) {
  const [quota, setQuota] = useState(initialQuota)

  const initQuota = useCallback((data) => {
    setQuota(data ?? {})
  }, [])

  const decrement = useCallback((settingCode) => {
    setQuota((prev) => {
      const current = prev[settingCode]
      if (!current) return prev
      return {
        ...prev,
        [settingCode]: {
          ...current,
          used: current.used + 1,
          remaining: Math.max(0, current.remaining - 1),
        },
      }
    })
  }, [])

  const rollback = useCallback((settingCode) => {
    setQuota((prev) => {
      const current = prev[settingCode]
      if (!current) return prev
      return {
        ...prev,
        [settingCode]: {
          ...current,
          used: Math.max(0, current.used - 1),
          remaining: current.remaining + 1,
        },
      }
    })
  }, [])

  const getQuota = useCallback(
    (settingCode) => {
      return quota[settingCode] ?? null
    },
    [quota],
  )

  return { quota, initQuota, decrement, rollback, getQuota }
}
