import { createContext, useContext, useEffect, useState } from 'react'

import { useSnackbar } from '@/context/SnackbarContext'
import { request } from '@/utils/Http'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const { showSnackbar } = useSnackbar()

  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')

      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const res = await request('/profiles')

        setUser(res)
        setToken(storedToken)
      } catch (err) {
        showSnackbar('error', err.message)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const me = async () => {
    try {
      const res = await request('/profiles')

      setUser(res)
    } catch (err) {
      showSnackbar('error', err.message)
      logout()
    }
  }

  const login = async (token) => {
    try {
      localStorage.setItem('token', token)
      setToken(token)

      const res = await request('/profiles')

      setUser(res)
    } catch (err) {
      showSnackbar('error', err.message)
      logout()
    }
  }

  const logout = () => {
    localStorage.removeItem('token')

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        me,
        login,
        logout,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'A',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
