'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { useReservationStore } from '@/store/useReservationStore'
import Calendar from '@/components/Calendar'
import OfficeMap from '@/components/OfficeMap'
import ConfirmDialog from '@/components/ConfirmDialog'
import HamburgerMenu from '@/components/HamburgerMenu'
import ThemeToggle from '@/components/ThemeToggle'
import { formatDate, parseLocalDate } from '@/lib/utils'

interface Desk {
  id: string
  x: number
  y: number
  width: number
  height: number
  desk_number: string
  status: 'available' | 'reserved' | 'permanently_occupied'
}

interface Reservation {
  id: string
  user_id: string
  desk_id: string
  date: string
  desk_number?: string
  username?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const hydrate = useAuthStore((state) => state.hydrate)
  const { selectedDate, setSelectedDate, reservations, setReservations } =
    useReservationStore()

  const [desks, setDesks] = useState<Desk[]>([])
  const [officeMap, setOfficeMap] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [allReservations, setAllReservations] = useState<Reservation[]>([])
  const [exemptions, setExemptions] = useState<any[]>([])
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingReservation, setPendingReservation] = useState<{
    desk: Desk
    dateString: string
    formattedDate: string
  } | null>(null)
  
  // Exemption dialog state
  const [showExemptDialog, setShowExemptDialog] = useState(false)
  const [pendingExemption, setPendingExemption] = useState<{
    desk: Desk
    dateString: string
    formattedDate: string
  } | null>(null)
  
  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    // Hydrate user from localStorage on mount
    hydrate()
  }, [])

  useEffect(() => {
    // Redirect to login if no user after hydration
    if (!user) {
      router.push('/login')
      return
    }

    fetchData()
  }, [user, router])

  const fetchData = async () => {
    try {
      // Fetch desks
      const desksResponse = await fetch('/api/desks', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const desksData = await desksResponse.json()
      console.log('📊 Dashboard - Desks:', desksData.desks)
      setDesks(desksData.desks || [])

      // Fetch office map
      const mapResponse = await fetch('/api/office-map', {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const mapData = await mapResponse.json()
      console.log('📊 Dashboard - Office Map:', mapData.officeMap)
      setOfficeMap(mapData.officeMap?.image_url || '')

      // Fetch all reservations
      const reservationsResponse = await fetch('/api/reservations')
      const reservationsData = await reservationsResponse.json()
      console.log('📊 All Reservations with usernames:', reservationsData.reservations)
      setAllReservations(reservationsData.reservations || [])

      // Fetch user's reservations
      if (user) {
        const userReservationsResponse = await fetch(
          `/api/reservations?userId=${user.id}`
        )
        const userReservationsData = await userReservationsResponse.json()
        const userReservationsWithDeskNumbers =
          userReservationsData.reservations.map((r: Reservation) => {
            const desk = desksData.desks.find((d: Desk) => d.id === r.desk_id)
            return { ...r, desk_number: desk?.desk_number }
          })
        setReservations(userReservationsWithDeskNumbers)
      }

      // Fetch exemptions
      const exemptionsResponse = await fetch('/api/desk-exemptions')
      const exemptionsData = await exemptionsResponse.json()
      console.log('📊 Desk Exemptions:', exemptionsData.exemptions)
      setExemptions(exemptionsData.exemptions || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleDeskClick = async (desk: Desk) => {
    if (!user) return

    const dateString = formatDate(selectedDate)
    const formattedDate = new Intl.DateTimeFormat('hr-HR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(selectedDate)

    // Check if already reserved
    const isReserved = allReservations.some(
      (r) => r.desk_id === desk.id && r.date === dateString
    )

    if (isReserved) {
      alert('Ovo mjesto je već rezervirano za odabrani dan')
      return
    }

    // Check if user already has reservation for this day
    const hasReservation = reservations.some((r) => r.date === dateString)

    if (hasReservation) {
      alert('Već imate rezervaciju za ovaj dan. Možete rezervirati samo jedno mjesto po danu.')
      return
    }

    // Show confirmation dialog
    setPendingReservation({ desk, dateString, formattedDate })
    setShowConfirmDialog(true)
  }

  const handleConfirmReservation = async () => {
    if (!user || !pendingReservation) return

    setShowConfirmDialog(false)

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          desk_id: pendingReservation.desk.id,
          date: pendingReservation.dateString,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert(`Uspješno ste rezervirali mjesto ${pendingReservation.desk.desk_number}!`)
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri rezervaciji')
    } finally {
      setPendingReservation(null)
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false)
    setPendingReservation(null)
  }

  const handleExemptDesk = async (desk: Desk) => {
    if (!user) return

    const dateString = formatDate(selectedDate)
    const formattedDate = new Intl.DateTimeFormat('hr-HR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(selectedDate)

    // Show exemption confirmation dialog
    setPendingExemption({ desk, dateString, formattedDate })
    setShowExemptDialog(true)
  }

  const handleConfirmExemption = async () => {
    if (!user || !pendingExemption) return

    setShowExemptDialog(false)

    try {
      const response = await fetch('/api/desk-exemptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          desk_id: pendingExemption.desk.id,
          date: pendingExemption.dateString,
          created_by: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert(`Mjesto ${pendingExemption.desk.desk_number} je oslobođeno za ${pendingExemption.formattedDate}!`)
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri oslobađanju mjesta')
    } finally {
      setPendingExemption(null)
    }
  }

  const handleCancelExemption = () => {
    setShowExemptDialog(false)
    setPendingExemption(null)
  }

  const handleCancelReservation = async (reservationId: string) => {
    if (!confirm('Da li ste sigurni da želite otkazati ovu rezervaciju?'))
      return

    try {
      const isEditor = user?.is_editor === true ? 'true' : 'false'
      const response = await fetch(
        `/api/reservations?id=${reservationId}&userId=${user?.id}&isEditor=${isEditor}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Greška pri otkazivanju rezervacije')
      }

      alert('Rezervacija uspješno otkazana')
      fetchData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri otkazivanju')
    }
  }

  const handleLogout = () => {
    logout() // This now also clears localStorage
    router.push('/login')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Nove lozinke se ne podudaraju')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Nova lozinka mora imati najmanje 6 znakova')
      return
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('✅ Lozinka uspješno promijenjena!')
      setShowPasswordDialog(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Greška pri promjeni lozinke')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Get user's reserved dates
  const reservedDates = reservations.map((r) => r.date)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white">
              Rezervacija Mjesta
            </h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-gray-600 dark:text-gray-300">
                Dobrodošli, <span className="font-semibold">{user?.username}</span>
              </span>
              <ThemeToggle />
              <button
                onClick={() => setShowPasswordDialog(true)}
                className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Promijeni lozinku"
              >
                <span className="hidden sm:inline">Lozinka</span>
                <span className="sm:hidden">🔒</span>
              </button>
              {user?.is_admin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <span className="hidden sm:inline">Admin Panel</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <span className="hidden sm:inline">Odjavi se</span>
                <span className="sm:hidden">Odjava</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Calendar - Above map on mobile */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Odaberi Datum</h2>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              reservedDates={reservedDates}
            />
          </div>

          {/* Office Map - Main focus on mobile */}
          <div className="min-h-[600px] h-[70vh]">
            <OfficeMap
              desks={desks}
              backgroundImage={officeMap}
              selectedDate={selectedDate}
              onDeskClick={handleDeskClick}
              reservations={allReservations}
              exemptions={exemptions}
              onExemptDesk={handleExemptDesk}
            />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:flex-col space-y-6">
          {/* Calendar - Full Width Above Map */}
          <div className="w-full">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              reservedDates={reservedDates}
            />
          </div>

          {/* Office Map and Reservations - Side by Side */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Office Map - Takes most space */}
            <div className="lg:col-span-10">
              <OfficeMap
                desks={desks}
                backgroundImage={officeMap}
                selectedDate={selectedDate}
                onDeskClick={handleDeskClick}
                reservations={allReservations}
                exemptions={exemptions}
                onExemptDesk={handleExemptDesk}
              />
            </div>

            {/* Reservations List - Right - Desktop only */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Moje Rezervacije
                </h2>

                {reservations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Nemate aktivnih rezervacija
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {reservations
                      .sort(
                        (a, b) =>
                          parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
                      )
                      .map((reservation) => {
                        const date = parseLocalDate(reservation.date)
                        const isPast =
                          date < new Date(new Date().setHours(0, 0, 0, 0))

                        return (
                          <div
                            key={reservation.id}
                            className={`p-4 rounded-lg border-2 ${
                              isPast
                                ? 'bg-gray-50 border-gray-200'
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  Mjesto {reservation.desk_number}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {new Intl.DateTimeFormat('hr-HR', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }).format(date)}
                                </p>
                              </div>
                              {!isPast && (
                                <button
                                  onClick={() =>
                                    handleCancelReservation(reservation.id)
                                  }
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Otkaži
                                </button>
                              )}
                            </div>
                            {isPast && (
                              <span className="text-xs text-gray-500 mt-2 block">
                                Završeno
                              </span>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>

              {/* Today's reservations */}
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Rezervacije za {formatDate(selectedDate)}
                </h2>

                {allReservations.filter((r) => r.date === formatDate(selectedDate))
                  .length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nema rezervacija za odabrani dan
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {allReservations
                      .filter((r) => r.date === formatDate(selectedDate))
                      .map((reservation) => {
                        const desk = desks.find((d) => d.id === reservation.desk_id)
                        const isPast =
                          parseLocalDate(reservation.date) < new Date(new Date().setHours(0, 0, 0, 0))
                        return (
                          <div
                            key={reservation.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800">
                                  Mjesto {desk?.desk_number}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {reservation.username || 'Nepoznato'}
                                </p>
                              </div>
                              {!isPast && user?.is_editor && (
                                <button
                                  onClick={() =>
                                    handleCancelReservation(reservation.id)
                                  }
                                  className="text-red-600 hover:text-red-800 text-xs font-medium"
                                >
                                  Otkaži
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Hamburger Menu - Reservations */}
      <HamburgerMenu title="Rezervacije">
        <div className="space-y-6">
          {/* Moje Rezervacije */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Moje Rezervacije
            </h3>

            {reservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">
                Nemate aktivnih rezervacija
              </p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {reservations
                  .sort(
                    (a, b) =>
                      parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime()
                  )
                  .map((reservation) => {
                    const date = parseLocalDate(reservation.date)
                    const isPast =
                      date < new Date(new Date().setHours(0, 0, 0, 0))

                    return (
                      <div
                        key={reservation.id}
                        className={`p-3 rounded-lg border-2 ${
                          isPast
                            ? 'bg-gray-50 border-gray-200'
                            : 'bg-blue-50 border-blue-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">
                              Mjesto {reservation.desk_number}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Intl.DateTimeFormat('hr-HR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              }).format(date)}
                            </p>
                          </div>
                          {!isPast && (
                            <button
                              onClick={() =>
                                handleCancelReservation(reservation.id)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Otkaži
                            </button>
                          )}
                        </div>
                        {isPast && (
                          <span className="text-xs text-gray-500 mt-2 block">
                            Završeno
                          </span>
                        )}
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Today's reservations */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Rezervacije za {formatDate(selectedDate)}
            </h3>

            {allReservations.filter((r) => r.date === formatDate(selectedDate))
              .length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">
                Nema rezervacija za odabrani dan
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {allReservations
                  .filter((r) => r.date === formatDate(selectedDate))
                  .map((reservation) => {
                    const desk = desks.find((d) => d.id === reservation.desk_id)
                    const isPast =
                      parseLocalDate(reservation.date) < new Date(new Date().setHours(0, 0, 0, 0))
                    return (
                      <div
                        key={reservation.id}
                        className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              Mjesto {desk?.desk_number}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {reservation.username || 'Nepoznato'}
                            </p>
                          </div>
                          {!isPast && user?.is_editor && (
                            <button
                              onClick={() =>
                                handleCancelReservation(reservation.id)
                              }
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Otkaži
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </HamburgerMenu>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Potvrda Rezervacije"
        message={
          pendingReservation
            ? `Da li želite rezervirati mjesto ${pendingReservation.desk.desk_number} za ${pendingReservation.formattedDate}?`
            : ''
        }
        onConfirm={handleConfirmReservation}
        onCancel={handleCancelConfirmation}
        confirmText="Da, rezerviraj"
        cancelText="Ne, odustani"
      />

      {/* Exemption Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showExemptDialog}
        title="Oslobodi Trajno Rezervirano Mjesto"
        message={
          pendingExemption
            ? `Da li želite osloboditi mjesto ${pendingExemption.desk.desk_number} za ${pendingExemption.formattedDate}? Mjesto će postati dostupno za rezervaciju samo za ovaj dan.`
            : ''
        }
        onConfirm={handleConfirmExemption}
        onCancel={handleCancelExemption}
        confirmText="Da, oslobodi"
        cancelText="Ne, odustani"
      />

      {/* Password Change Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Promijeni Lozinku
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trenutna Lozinka
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Lozinka
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Potvrdi Novu Lozinku
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordDialog(false)
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Promijeni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

