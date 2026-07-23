import { useState, useEffect, useRef, useCallback } from 'react'
import { request } from '@/utils/Http'

export function useAutocomplete(value, topic, onChange) {
  const [suggestion, setSuggestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debounceRef = useRef(null)
  
  // Track previous value to detect exact space triggers
  const prevValueRef = useRef(value)

  const fetchSuggestion = async (text) => {
    setIsLoading(true)
    try {
      const res = await request('/autocomplete', { method: 'POST', body: { text, topic } })
      if (res?.suggestion) {
        setSuggestion(res.suggestion)
      } else {
        setSuggestion('')
      }
    } catch (err) {
      console.error('Autocomplete error:', err)
      setSuggestion('')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestion('')
      prevValueRef.current = value
      return
    }

    const lastChar = value.slice(-1)
    const valueChanged = value !== prevValueRef.current
    const justTypedSpace = lastChar === ' ' && valueChanged

    prevValueRef.current = value

    if (justTypedSpace) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      
      debounceRef.current = setTimeout(() => {
        fetchSuggestion(value)
      }, 400)
    } else if (valueChanged) {
      // Only clear if the user actually typed something else
      if (suggestion) {
        setSuggestion('')
      }
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, suggestion])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault()
      // Append suggestion
      onChange(value + suggestion)
      setSuggestion('')
    }
  }, [suggestion, value, onChange])

  return {
    suggestion,
    isLoading,
    handleKeyDown,
    clearSuggestion: () => setSuggestion('')
  }
}
