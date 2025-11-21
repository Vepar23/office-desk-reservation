import { create } from 'zustand'

interface Reservation {
  id: string
  user_id: string
  desk_id: string
  date: string
  desk_number?: string
}

interface ReservationState {
  reservations: Reservation[]
  selectedDate: Date
  setReservations: (reservations: Reservation[]) => void
  setSelectedDate: (date: Date) => void
  addReservation: (reservation: Reservation) => void
  removeReservation: (id: string) => void
}

export const useReservationStore = create<ReservationState>((set) => ({
  reservations: [],
  // Postavi default datum na danas u lokalnom timezone-u
  selectedDate: (() => {
    const now = new Date()
    // Kreiraj novi datum u lokalnom timezone-u (ponoć)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  })(),
  setReservations: (reservations) => set({ reservations }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addReservation: (reservation) =>
    set((state) => ({ reservations: [...state.reservations, reservation] })),
  removeReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
}))

