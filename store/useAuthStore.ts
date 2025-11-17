import { create } from 'zustand'

interface User {
  id: string
  username: string
  is_admin: boolean
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    // Clear localStorage to prevent auto-login
    localStorage.removeItem('user')
    set({ user: null })
  },
}))

