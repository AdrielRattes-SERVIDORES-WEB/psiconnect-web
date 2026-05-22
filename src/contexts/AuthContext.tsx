import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthUser { token: string; papel: string; nome: string; email: string }

interface AuthContextType {
  user: AuthUser | null
  login: (data: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('psiconnect_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const login = (data: AuthUser) => {
    localStorage.setItem('psiconnect_token', data.token)
    localStorage.setItem('psiconnect_user', JSON.stringify(data))
    setUser(data)
  }

  const logout = () => {
    localStorage.removeItem('psiconnect_token')
    localStorage.removeItem('psiconnect_user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
