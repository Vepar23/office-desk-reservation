import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword, verifyPassword, validatePassword } from '@/lib/auth'

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

// Fallback in-memory storage
let usersMemory: any[] = [
  {
    id: '1',
    username: 'admin',
    password_hash: '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K',
    is_admin: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json()

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Svi podaci su obavezni' },
        { status: 400 }
      )
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: 'Nova lozinka mora imati najmanje 6 znakova' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const user = usersMemory.find((u) => u.id === userId)

      if (!user) {
        return NextResponse.json(
          { error: 'Korisnik nije pronađen' },
          { status: 404 }
        )
      }

      // Provjeri trenutnu lozinku
      const isValid = await verifyPassword(currentPassword, user.password_hash)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Trenutna lozinka nije ispravna' },
          { status: 401 }
        )
      }

      // Ažuriraj lozinku
      const newHash = await hashPassword(newPassword)
      user.password_hash = newHash

      return NextResponse.json(
        { success: true, message: 'Lozinka uspješno promijenjena' },
        { status: 200 }
      )
    }

    // Dohvati korisnika iz Supabase
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    // Provjeri trenutnu lozinku
    const isValid = await verifyPassword(currentPassword, user.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Trenutna lozinka nije ispravna' },
        { status: 401 }
      )
    }

    // Ažuriraj lozinku
    const newHash = await hashPassword(newPassword)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Lozinka uspješno promijenjena' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Greška pri promjeni lozinke' },
      { status: 500 }
    )
  }
}

