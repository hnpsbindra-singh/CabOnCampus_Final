import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || null
    } catch {
      return null
    }
  })
  
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  function login(token, userData) {
    try {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error('Storage error:', e)
    }
    setToken(token)
    setUser(userData)
  }

  function logout() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } catch (e) {
      console.error('Storage error:', e)
    }
    setToken(null)
    setUser(null)
  }

  function parseRole() {
    if (!token || typeof token !== 'string') return null
    try {
      const parts = token.split('.')
      if (parts.length < 2) return null
      const base64Url = parts[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const pad = base64.length % 4
      const paddedBase64 = pad ? base64 + '='.repeat(4 - pad) : base64
      const decoded = atob(paddedBase64)
      const payload = JSON.parse(decoded)
      const r = payload.role || ''
      return r.replace('ROLE_', '')
    } catch (err) {
      console.error('JWT parse error:', err)
      return null
    }
  }

  const role = parseRole()

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
