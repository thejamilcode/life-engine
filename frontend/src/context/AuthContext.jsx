// src/context/AuthContext.jsx
// ====================================================
// Global Auth State — পুরো অ্যাপে user info রাখে
// ====================================================

import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(localStorage.getItem('life_engine_token'))
  const [loading, setLoading] = useState(true)

  // App load হলে token থেকে user বের করো
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('life_engine_token')
      if (savedToken) {
        try {
          const userData = await getMe()
          setUser(userData)
        } catch {
          // Token expired বা invalid
          localStorage.removeItem('life_engine_token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (username, password) => {
    const data = await loginUser(username, password)
    localStorage.setItem('life_engine_token', data.access)
    setToken(data.access)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await registerUser(userData)
    localStorage.setItem('life_engine_token', data.access)
    setToken(data.access)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('life_engine_token')
    localStorage.removeItem('life_engine_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — যেকোনো component থেকে useAuth() দিয়ে ব্যবহার করো
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
