'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import OfficeMap from '@/components/OfficeMap'

interface Desk {
  id: string
  x: number
  y: number
  width: number
  height: number
  desk_number: string
  status: 'available' | 'reserved' | 'permanently_occupied'
}

interface User {
  id: string
  username: string
  is_admin: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [activeTab, setActiveTab] = useState<'users' | 'map' | 'desks'>('map')
  const [desks, setDesks] = useState<Desk[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [officeMap, setOfficeMap] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // User creation form
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    is_admin: false,
  })

  // Desk creation form
  const [newDesk, setNewDesk] = useState({
    desk_number: '',
    status: 'available' as 'available' | 'permanently_occupied',
  })

  // Image upload
  const [imageUrl, setImageUrl] = useState('')
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string>('')

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/login')
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (!parsedUser.is_admin) {
      alert('Nemate pristup admin panelu')
      router.push('/dashboard')
      return
    }

    if (!user) {
      useAuthStore.getState().setUser(parsedUser)
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      const [desksRes, usersRes, mapRes] = await Promise.all([
        fetch('/api/desks', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }),
        fetch('/api/users', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }),
        fetch('/api/office-map', {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        }),
      ])

      const desksData = await desksRes.json()
      const usersData = await usersRes.json()
      const mapData = await mapRes.json()

      console.log('📊 Admin Panel - Fetched Data:', {
        desks: desksData.desks,
        users: usersData.users,
        officeMap: mapData.officeMap,
      })

      setDesks(desksData.desks || [])
      setUsers(usersData.users || [])
      setOfficeMap(mapData.officeMap?.image_url || '')
      setImageUrl(mapData.officeMap?.image_url || '')
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Korisnik uspješno kreiran!')
      setNewUser({ username: '', password: '', is_admin: false })
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri kreiranju korisnika')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovog korisnika?'))
      return

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Greška pri brisanju korisnika')
      }

      alert('Korisnik uspješno obrisan')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri brisanju')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadMap = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let finalImageUrl = imageUrl

      // If file upload method, upload file first
      if (uploadMethod === 'file' && selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const uploadData = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(uploadData.error)
        }

        finalImageUrl = uploadData.url
      }

      if (!finalImageUrl) {
        throw new Error('Molimo unesite URL ili odaberite fajl')
      }

      // Save to office map
      const response = await fetch('/api/office-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: finalImageUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Mapa ureda uspješno uploadana!')
      setSelectedFile(null)
      setPreviewUrl('')
      setImageUrl('')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri uploadu mape')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateDesk = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/desks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          x: 100,
          y: 100,
          width: 80,
          height: 80,
          desk_number: newDesk.desk_number,
          status: newDesk.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Stol uspješno kreiran!')
      setNewDesk({ desk_number: '', status: 'available' })
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri kreiranju stola')
    }
  }

  const handleDeskUpdate = async (desk: Desk) => {
    try {
      const response = await fetch('/api/desks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(desk),
      })

      if (response.ok) {
        setDesks((prev) =>
          prev.map((d) => (d.id === desk.id ? desk : d))
        )
        
        // Prikaži poruku o uspešnom čuvanju
        setSaveMessage('✅ Pozicija uspješno spremljena!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error updating desk:', error)
      setSaveMessage('❌ Greška pri spremanju')
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handleDeskDelete = async (deskId: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj stol?')) return

    try {
      const response = await fetch(`/api/desks?id=${deskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Greška pri brisanju stola')
      }

      alert('Stol uspješno obrisan')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri brisanju')
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Admin: <span className="font-semibold">{user?.username}</span>
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Odjavi se
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'map'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Mapa Ureda
          </button>
          <button
            onClick={() => setActiveTab('desks')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'desks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Stolovi
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'users'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Korisnici
          </button>
        </div>

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Upload Mape Ureda
              </h2>

              {/* Upload Method Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Metoda Upload-a
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod('file')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                      uploadMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📁 Upload Fajla
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod('url')}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
                      uploadMethod === 'url'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🔗 URL Slike
                  </button>
                </div>
              </div>

              <form onSubmit={handleUploadMap} className="space-y-4">
                {/* File Upload Method */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odaberite Sliku ili PDF
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {previewUrl ? (
                          <div className="space-y-3 text-center">
                            {selectedFile?.type === 'application/pdf' ? (
                              <div className="text-6xl">📄</div>
                            ) : (
                              <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-h-48 rounded-lg shadow-md"
                              />
                            )}
                            <p className="text-sm font-medium text-gray-700">
                              {selectedFile?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                setSelectedFile(null)
                                setPreviewUrl('')
                              }}
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Ukloni fajl
                            </button>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="w-16 h-16 text-gray-400 mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Kliknite da odaberete fajl
                            </p>
                            <p className="text-xs text-gray-500">
                              JPG, PNG, WEBP, GIF ili PDF (Maks. 5MB)
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Preporučena rezolucija: minimum 1200x800px za najbolji prikaz
                    </p>
                  </div>
                )}

                {/* URL Method */}
                {uploadMethod === 'url' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slike
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/office-map.jpg"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unesite javni URL slike mape ureda (mora biti HTTPS)
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !imageUrl)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Mapu'
                  )}
                </button>
              </form>

              {/* Current Map Preview */}
              {officeMap && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Trenutna Mapa
                  </h3>
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={officeMap}
                      alt="Current office map"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save Message Notification */}
            {saveMessage && (
              <div className="fixed top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border-2 border-green-500 animate-fade-in">
                <p className="font-semibold text-gray-800">{saveMessage}</p>
              </div>
            )}

            <div className="h-[800px] max-w-[1400px]">
              <OfficeMap
                desks={desks}
                backgroundImage={officeMap}
                selectedDate={new Date()}
                isAdmin={true}
                onDeskUpdate={handleDeskUpdate}
                onDeskDelete={handleDeskDelete}
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="text-sm text-yellow-800">
                  <div className="font-semibold mb-1">Napomena o pozicijama:</div>
                  <p>Pozicije stolova koje postavite ovdje će biti identične na user view-u. Mapa ima istu veličinu i proporciju na oba ekrana. Pozicije se automatski spremaju nakon što pustite stol.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desks Tab */}
        {activeTab === 'desks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Dodaj Novi Stol
              </h2>
              <form onSubmit={handleCreateDesk} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Broj Stola
                    </label>
                    <input
                      type="text"
                      value={newDesk.desk_number}
                      onChange={(e) =>
                        setNewDesk({ ...newDesk, desk_number: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="npr. A1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={newDesk.status}
                      onChange={(e) =>
                        setNewDesk({
                          ...newDesk,
                          status: e.target.value as 'available' | 'permanently_occupied',
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">Dostupno</option>
                      <option value="permanently_occupied">Trajno zauzeto</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Dodaj Stol
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Lista Stolova ({desks.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {desks.map((desk) => (
                  <div
                    key={desk.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">Stol {desk.desk_number}</p>
                      <p className="text-sm text-gray-600">
                        Pozicija: X:{desk.x}, Y:{desk.y}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeskDelete(desk.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Obriši
                    </button>
                  </div>
                ))}
                {desks.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nema kreiranih stolova
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Kreiraj Novog Korisnika
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Korisničko Ime
                    </label>
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="username"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lozinka
                    </label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={newUser.is_admin}
                    onChange={(e) =>
                      setNewUser({ ...newUser, is_admin: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_admin" className="text-sm text-gray-700">
                    Admin privilegije
                  </label>
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Kreiraj Korisnika
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Lista Korisnika ({users.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-gray-600">
                        {user.is_admin ? 'Administrator' : 'Korisnik'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Obriši
                    </button>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nema kreiranih korisnika
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

