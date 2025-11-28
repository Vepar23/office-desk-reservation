'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import OfficeMap from '@/components/OfficeMap'
import ThemeToggle from '@/components/ThemeToggle'

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
  is_editor?: boolean
  locked?: boolean
  failed_login_attempts?: number
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
    is_editor: false,
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

  // Reset Password Dialog
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false)

  // Edit Role Dialog
  const [showEditRoleDialog, setShowEditRoleDialog] = useState(false)
  const [editRoleUser, setEditRoleUser] = useState<User | null>(null)
  const [editRoleForm, setEditRoleForm] = useState({
    is_admin: false,
    is_editor: false,
  })

  useEffect(() => {
    // Don't auto-login from localStorage - require fresh login
    if (!user) {
      router.push('/login')
      return
    }

    if (!user.is_admin) {
      alert('Nemate pristup admin panelu')
      router.push('/dashboard')
      return
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
        body: JSON.stringify({
          ...newUser,
          requestingUserId: user?.id, // 🔒 SECURITY: Send requesting user ID
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Korisnik uspješno kreiran!')
      setNewUser({ username: '', password: '', is_admin: false, is_editor: false })
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri kreiranju korisnika')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovog korisnika?'))
      return

    try {
      const response = await fetch(`/api/users?id=${userId}&requestingUserId=${user?.id}`, {
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

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !newPassword) {
      alert('Molimo unesite novu lozinku')
      return
    }

    if (newPassword.length < 6) {
      alert('Lozinka mora imati najmanje 6 znakova')
      return
    }

    setResetPasswordLoading(true)

    try {
      const response = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user?.id,
          targetUserId: resetPasswordUser.id,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri postavljanju nove lozinke')
      }

      alert(data.message || 'Lozinka uspješno postavljena')
      setShowResetPasswordDialog(false)
      setResetPasswordUser(null)
      setNewPassword('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri postavljanju nove lozinke')
    } finally {
      setResetPasswordLoading(false)
    }
  }

  const handleUnlockAccount = async (targetUser: User) => {
    if (!confirm(`Želite li otključati račun korisnika "${targetUser.username}"?`))
      return

    try {
      const response = await fetch('/api/auth/admin/unlock-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user?.id,
          targetUserId: targetUser.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri otključavanju računa')
      }

      alert(data.message || 'Račun uspješno otključan')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri otključavanju računa')
    }
  }

  const handleUpdateRole = async () => {
    if (!editRoleUser) return

    try {
      const response = await fetch('/api/users/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editRoleUser.id,
          is_admin: editRoleForm.is_admin,
          is_editor: editRoleForm.is_editor,
          requestingUserId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Greška pri ažuriranju role')
      }

      alert('Rola uspješno ažurirana!')
      setShowEditRoleDialog(false)
      setEditRoleUser(null)
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri ažuriranju role')
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
        throw new Error('Molimo unesite URL ili odaberite datoteku')
      }

      // Save to office map
      const response = await fetch('/api/office-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image_url: finalImageUrl,
          requestingUserId: user?.id, // 🔒 SECURITY: Send requesting user ID
        }),
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
          requestingUserId: user?.id, // 🔒 SECURITY: Send requesting user ID
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
        body: JSON.stringify({
          ...desk,
          requestingUserId: user?.id, // 🔒 SECURITY: Send requesting user ID
        }),
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
      const response = await fetch(`/api/desks?id=${deskId}&requestingUserId=${user?.id}`, {
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
    logout() // This now also clears localStorage
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                Admin: <span className="font-semibold">{user?.username}</span>
              </span>
              <ThemeToggle />
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
                    Prijenos datoteke
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
                              Ukloni datoteku
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
                              Kliknite da odaberete datoteku
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
                <div className="space-y-2">
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_editor"
                      checked={newUser.is_editor}
                      onChange={(e) =>
                        setNewUser({ ...newUser, is_editor: e.target.checked })
                      }
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="is_editor" className="text-sm text-gray-700">
                      Editor privilegije (može brisati sve rezervacije)
                    </label>
                  </div>
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
                {users.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{userItem.username}</p>
                        {userItem.locked && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                            🔒 Zaključan
                          </span>
                        )}
                        {!userItem.locked && userItem.failed_login_attempts && userItem.failed_login_attempts > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold">
                            ⚠️ {userItem.failed_login_attempts}/5 pokušaja
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {userItem.is_admin ? 'Administrator' : userItem.is_editor ? 'Editor' : 'Korisnik'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {userItem.locked && (
                        <button
                          onClick={() => handleUnlockAccount(userItem)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          title="Otključaj račun"
                        >
                          🔓 Otključaj
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditRoleUser(userItem)
                          setEditRoleForm({
                            is_admin: userItem.is_admin || false,
                            is_editor: userItem.is_editor || false,
                          })
                          setShowEditRoleDialog(true)
                        }}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                        title="Izmijeni rolu"
                      >
                        👤 Rola
                      </button>
                      <button
                        onClick={() => {
                          setResetPasswordUser(userItem)
                          setShowResetPasswordDialog(true)
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                        title="Postavi novu lozinku"
                      >
                        🔑 Lozinka
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                        title="Obriši korisnika"
                      >
                        🗑️ Obriši
                      </button>
                    </div>
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

      {/* Reset Password Dialog */}
      {showResetPasswordDialog && resetPasswordUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Postavi Novu Lozinku
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Postavljanje nove lozinke za korisnika: <strong>{resetPasswordUser.username}</strong>
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nova Lozinka (min 6 znakova)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Unesite novu lozinku"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={resetPasswordLoading}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleResetPassword}
                  disabled={resetPasswordLoading || !newPassword}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {resetPasswordLoading ? 'Postavljanje...' : 'Potvrdi'}
                </button>
                <button
                  onClick={() => {
                    setShowResetPasswordDialog(false)
                    setResetPasswordUser(null)
                    setNewPassword('')
                  }}
                  disabled={resetPasswordLoading}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition disabled:bg-gray-200 disabled:cursor-not-allowed font-semibold"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Dialog */}
      {showEditRoleDialog && editRoleUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Izmijeni Rolu
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Izmjena role za korisnika: <strong>{editRoleUser.username}</strong>
            </p>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit_is_admin"
                    checked={editRoleForm.is_admin}
                    onChange={(e) =>
                      setEditRoleForm({ ...editRoleForm, is_admin: e.target.checked })
                    }
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="edit_is_admin" className="text-sm text-gray-700 dark:text-gray-300">
                    Administrator (puni pristup svemu)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="edit_is_editor"
                    checked={editRoleForm.is_editor}
                    onChange={(e) =>
                      setEditRoleForm({ ...editRoleForm, is_editor: e.target.checked })
                    }
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="edit_is_editor" className="text-sm text-gray-700 dark:text-gray-300">
                    Editor (može brisati sve rezervacije)
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUpdateRole}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  Sačuvaj
                </button>
                <button
                  onClick={() => {
                    setShowEditRoleDialog(false)
                    setEditRoleUser(null)
                  }}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition font-semibold"
                >
                  Otkaži
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

