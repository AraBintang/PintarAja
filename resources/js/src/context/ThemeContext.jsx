import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pintaraja-theme')
      return saved || 'system'
    }
    return 'system'
  })

  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark')

    const updateTheme = () => {
      let effectiveDark = false

      if (theme === 'system') {
        effectiveDark = mediaQuery.matches
      } else {
        effectiveDark = theme === 'dark'
      }

      setIsDark(effectiveDark)

      const root = document.documentElement
      root.classList.toggle('dark', effectiveDark)

      localStorage.setItem('pintaraja-theme', theme)
    }

    updateTheme()

    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme)
      return () => mediaQuery.removeEventListener('change', updateTheme)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'system'
      return 'light'
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
