'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowWarning(false)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        // Provjeri da li ima attemptsRemaining u responsu
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining)
          
          // Ako ima 3 ili manje pokušaja, prikaži warning
          if (data.attemptsRemaining >= 0 && data.attemptsRemaining <= 2) {
            setShowWarning(true)
          }
        }
        
        throw new Error(data.error || 'Prijava nije uspjela')
      }

      // Store user in localStorage and state
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prijava nije uspjela')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dobrodošli
          </h1>
          <p className="text-gray-600">Prijavite se na svoj račun</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Korisničko ime
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Unesite korisničko ime"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Lozinka
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Unesite lozinku"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {showWarning && attemptsRemaining !== null && (
            <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg text-sm animate-pulse">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-bold">UPOZORENJE!</p>
                  <p className="mt-1">
                    Preostalo pokušaja: <strong>{attemptsRemaining}</strong>
                  </p>
                  <p className="mt-1 text-xs">
                    Nakon 5 neuspjelih pokušaja, vaš account će biti automatski zaključan i morat ćete kontaktirati administratora.
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Prijava u tijeku...' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  )
}

