import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../hooks/useApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setIsLoading(false); return }
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      localStorage.removeItem('accessToken')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('accessToken', data.accessToken)
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('accessToken')
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout, updateUser, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
