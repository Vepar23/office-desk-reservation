import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword } from '@/lib/auth'
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

// Fallback in-memory storage
let usersMemory = [
  {
    id: '1',
    username: 'admin',
    password_hash: '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K', // test123
    is_admin: true,
  },
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Korisničko ime i lozinka su obavezni' },
        { status: 400 }
      )
    }

    let user: any = null

    if (supabase) {
      // Koristi Supabase bazu
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { error: 'Neispravno korisničko ime ili lozinka' },
          { status: 401 }
        )
      }

      user = data

      // Provjeri da li je account lockovan
      if (user.locked) {
        return NextResponse.json(
          { error: 'Account je zaključan zbog previše neuspjelih pokušaja logina. Kontaktiraj administratora.' },
          { status: 403 }
        )
      }
    } else {
      // Fallback: in-memory storage
      user = usersMemory.find((u) => u.username === username)

      if (!user) {
        return NextResponse.json(
          { error: 'Neispravno korisničko ime ili lozinka' },
          { status: 401 }
        )
      }
    }

    // Provjeri lozinku
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) {
      // Failed login attempt
      if (supabase) {
        const newFailedAttempts = (user.failed_login_attempts || 0) + 1
        const shouldLock = newFailedAttempts >= 5

        await supabase
          .from('users')
          .update({
            failed_login_attempts: newFailedAttempts,
            locked: shouldLock,
            last_login_attempt: new Date().toISOString(),
          })
          .eq('id', user.id)

        if (shouldLock) {
          return NextResponse.json(
            { error: 'Account je zaključan zbog previše neuspjelih pokušaja. Kontaktiraj administratora.' },
            { status: 403 }
          )
        }

        return NextResponse.json(
          { 
            error: 'Neispravno korisničko ime ili lozinka',
            attemptsRemaining: 5 - newFailedAttempts
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Neispravno korisničko ime ili lozinka' },
        { status: 401 }
      )
    }

    // Uspješan login - resetuj failed attempts
    if (supabase) {
      await supabase
        .from('users')
        .update({
          failed_login_attempts: 0,
          last_login_attempt: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    // Ukloni hash lozinke i sensitive data prije slanja
    const { password_hash, failed_login_attempts, last_login_attempt, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške pri prijavi' },
      { status: 500 }
    )
  }
}

