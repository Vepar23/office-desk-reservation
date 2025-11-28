import { NextRequest, NextResponse } from 'next/server'
import { formatDate } from '@/lib/utils'
import { createClient } from '@supabase/supabase-js'

// Provjeri da li su Supabase kredencijali postavljeni
const hasSupabaseConfig = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')

const supabase = hasSupabaseConfig ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null

// Privremeni in-memory storage (fallback)
let reservationsMemory: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const date = searchParams.get('date')
    const withUsers = searchParams.get('withUsers') === 'true'

    if (!supabase) {
      // Fallback: In-memory storage
      let filteredReservations = [...reservationsMemory]

      if (userId) {
        filteredReservations = filteredReservations.filter((r) => r.user_id === userId)
      }

      if (date) {
        filteredReservations = filteredReservations.filter((r) => r.date === date)
      }

      return NextResponse.json({ reservations: filteredReservations }, { status: 200 })
    }

    // Koristi Supabase sa JOIN za imena korisnika
    let query = supabase
      .from('reservations')
      .select(`
        id,
        user_id,
        desk_id,
        date,
        created_at,
        users!inner(username)
      `)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transformiraj podatke da uključe username direktno
    const reservations = data.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      desk_id: r.desk_id,
      date: r.date,
      created_at: r.created_at,
      username: r.users?.username || 'Nepoznato'
    }))

    return NextResponse.json({ reservations }, { status: 200 })
  } catch (error) {
    console.error('Get reservations error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju rezervacija' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, desk_id, date } = await request.json()

    if (!user_id || !desk_id || !date) {
      return NextResponse.json(
        { error: 'Svi podaci su obavezni' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const existingReservation = reservationsMemory.find(
        (r) => r.user_id === user_id && r.date === date
      )

      if (existingReservation) {
        return NextResponse.json(
          { error: 'Već imate rezervaciju za ovaj dan' },
          { status: 409 }
        )
      }

      const deskReserved = reservationsMemory.find(
        (r) => r.desk_id === desk_id && r.date === date
      )

      if (deskReserved) {
        return NextResponse.json(
          { error: 'Ovo mjesto je već rezervirano za odabrani dan' },
          { status: 409 }
        )
      }

      const newReservation = {
        id: Date.now().toString(),
        user_id,
        desk_id,
        date,
        created_at: new Date().toISOString(),
      }

      reservationsMemory.push(newReservation)

      return NextResponse.json(
        {
          success: true,
          reservation: newReservation,
        },
        { status: 201 }
      )
    }

    // Provjeri da li korisnik već ima rezervaciju za taj dan
    const { data: existingUserReservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', user_id)
      .eq('date', date)
      .single()

    if (existingUserReservation) {
      return NextResponse.json(
        { error: 'Već imate rezervaciju za ovaj dan' },
        { status: 409 }
      )
    }

    // Provjeri da li je stol već rezerviran za taj dan
    const { data: existingDeskReservation } = await supabase
      .from('reservations')
      .select('*')
      .eq('desk_id', desk_id)
      .eq('date', date)
      .single()

    if (existingDeskReservation) {
      return NextResponse.json(
        { error: 'Ovo mjesto je već rezervirano za odabrani dan' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert([{ user_id, desk_id, date }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        reservation: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create reservation error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju rezervacije' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reservationId = searchParams.get('id')
    const userId = searchParams.get('userId')
    const isEditor = searchParams.get('isEditor') === 'true'

    if (!reservationId) {
      return NextResponse.json(
        { error: 'ID rezervacije je obavezan' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const index = reservationsMemory.findIndex((r) => r.id === reservationId)
      if (index === -1) {
        return NextResponse.json(
          { error: 'Rezervacija nije pronađena' },
          { status: 404 }
        )
      }

      // If not editor, check if reservation belongs to user
      if (!isEditor && reservationsMemory[index].user_id !== userId) {
        return NextResponse.json(
          { error: 'Nemate dozvolu za brisanje ove rezervacije' },
          { status: 403 }
        )
      }

      reservationsMemory.splice(index, 1)

      return NextResponse.json(
        { success: true, message: 'Rezervacija uspješno obrisana' },
        { status: 200 }
      )
    }

    // Fetch the reservation to check ownership
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('user_id')
      .eq('id', reservationId)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json(
        { error: 'Rezervacija nije pronađena' },
        { status: 404 }
      )
    }

    // If not editor, verify user owns this reservation
    if (!isEditor && reservation.user_id !== userId) {
      return NextResponse.json(
        { error: 'Nemate dozvolu za brisanje ove rezervacije' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Rezervacija uspješno obrisana' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete reservation error:', error)
    return NextResponse.json(
      { error: 'Greška pri brisanju rezervacije' },
      { status: 500 }
    )
  }
}

