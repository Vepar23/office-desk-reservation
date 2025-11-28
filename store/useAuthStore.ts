import { create } from 'zustand'

interface User {
  id: string
  username: string
  is_admin: boolean
  is_editor?: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  hydrate: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => {
    // Persist to localStorage
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    set({ user })
  },
  logout: () => {
    // Clear localStorage
    localStorage.removeItem('user')
    set({ user: null })
  },
  hydrate: () => {
    // Load user from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          set({ user })
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          localStorage.removeItem('user')
        }
      }
    }
  },
}))

