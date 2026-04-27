import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { Role } from '@/lib/enums'

interface AuthUser {
  sub: string
  email: string
  role: Role
  tenantId: string
}

interface AuthContextValue {
  user: AuthUser | null
  tenantCode: string
  login: (tenantCode: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseJwt(token: string): AuthUser {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  )
  return JSON.parse(json)
}

function loadUser(): AuthUser | null {
  const token = localStorage.getItem('vidya_token')
  if (!token) return null
  try {
    return parseJwt(token)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)
  const [tenantCode, setTenantCode] = useState(
    () => localStorage.getItem('vidya_tenant') ?? '',
  )

  const login = useCallback(
    async (code: string, email: string, password: string) => {
      localStorage.setItem('vidya_tenant', code)
      setTenantCode(code)

      const res = await api.post<{ accessToken: string }>('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('vidya_token', res.accessToken)
      setUser(parseJwt(res.accessToken))
    },
    [],
  )

  const logout = useCallback(() => {
    localStorage.removeItem('vidya_token')
    localStorage.removeItem('vidya_tenant')
    setUser(null)
    setTenantCode('')
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, tenantCode, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
