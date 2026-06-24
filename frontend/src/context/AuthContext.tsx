import { createContext, useContext, useState, type ReactNode } from 'react'

export interface UserInfo {
  id:       string
  username: string
  email:    string
}

interface AuthContextType {
  token:           string | null
  user:            UserInfo | null
  isAuthenticated: boolean
  login:           (token: string, remember: boolean) => void
  logout:          () => void
  updateUser:      (info: Partial<UserInfo>) => void
}

// The JWT is base64url: the payload is the second block separated by '.'
function decodeToken(token: string): UserInfo | null {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    return {
      id:       payload.sub,
      email:    payload.email,
      username: payload.username,
    }
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = localStorage.getItem('token') || sessionStorage.getItem('token')

  const [token, setToken] = useState<string | null>(stored)
  const [user,  setUser]  = useState<UserInfo | null>(() => stored ? decodeToken(stored) : null)

  const login = (newToken: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('token', newToken)
    } else {
      sessionStorage.setItem('token', newToken)
    }
    setToken(newToken)
    setUser(decodeToken(newToken))
  }

  const logout = () => {
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Update the status in memory after editing the profile (without re-login)
  const updateUser = (info: Partial<UserInfo>) => {
    setUser(prev => prev ? { ...prev, ...info } : null)
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}