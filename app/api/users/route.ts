import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword, validatePassword, validateUsername } from '@/lib/auth'

// Privremeni in-memory storage (fallback)
let usersMemory: any[] = [
  {
    id: '1',
    username: 'admin',
    password_hash: '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K',
    is_admin: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

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

// GET - Dohvati sve korisnike
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      // Fallback: In-memory storage
      const users = usersMemory.map(({ password_hash, ...user }) => user)
      return NextResponse.json({ users }, { status: 200 })
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, is_admin, locked, failed_login_attempts, created_at')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju korisnika' },
      { status: 500 }
    )
  }
}

// POST - Kreiraj novog korisnika
export async function POST(request: NextRequest) {
  try {
    const { username, password, is_admin } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Korisničko ime i lozinka su obavezni' },
        { status: 400 }
      )
    }

    if (!validateUsername(username)) {
      return NextResponse.json(
        { error: 'Korisničko ime mora imati najmanje 3 znaka' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 znakova' },
        { status: 400 }
      )
    }

    const password_hash = await hashPassword(password)

    if (!supabase) {
      // Fallback: In-memory storage
      // Provjeri da li korisnik već postoji
      const existingUser = usersMemory.find(u => u.username === username)
      if (existingUser) {
        return NextResponse.json(
          { error: 'Korisničko ime već postoji' },
          { status: 409 }
        )
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password_hash,
        is_admin: is_admin || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      usersMemory.push(newUser)
      
      const { password_hash: _, ...userWithoutPassword } = newUser
      return NextResponse.json(
        {
          success: true,
          user: userWithoutPassword,
        },
        { status: 201 }
      )
    }

    // Provjeri da li korisnik već postoji
    const { data: existingUsers } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUsers) {
      return NextResponse.json(
        { error: 'Korisničko ime već postoji' },
        { status: 409 }
      )
    }

    const newUser = {
      username,
      password_hash,
      is_admin: is_admin || false,
    }

    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
      .select('id, username, is_admin, created_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        user: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju korisnika' },
      { status: 500 }
    )
  }
}

// DELETE - Obriši korisnika
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID korisnika je obavezan' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const index = usersMemory.findIndex(u => u.id === userId)
      if (index === -1) {
        return NextResponse.json({ error: 'Korisnik nije pronađen' }, { status: 404 })
      }
      usersMemory.splice(index, 1)
      return NextResponse.json(
        { success: true, message: 'Korisnik uspješno obrisan' },
        { status: 200 }
      )
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Korisnik uspješno obrisan' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Greška pri brisanju korisnika' },
      { status: 500 }
    )
  }
}