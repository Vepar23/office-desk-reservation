import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, validatePassword, validateUsername } from '@/lib/auth'

// Privremeni in-memory storage
let users: any[] = []

export async function GET(request: NextRequest) {
  try {
    // TODO: Zamijeniti sa Supabase upitom
    // const { data, error } = await supabase.from('users').select('id, username, is_admin, created_at')

    const usersWithoutPasswords = users.map(({ password_hash, ...user }) => user)

    return NextResponse.json({ users: usersWithoutPasswords }, { status: 200 })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju korisnika' },
      { status: 500 }
    )
  }
}

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
        { error: 'Korisničko ime mora imati najmanje 3 znaka i sadržavati samo slova, brojeve i _' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Lozinka mora imati najmanje 6 znakova' },
        { status: 400 }
      )
    }

    // Provjeri da li korisnik već postoji
    const existingUser = users.find((u) => u.username === username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Korisničko ime već postoji' },
        { status: 409 }
      )
    }

    const password_hash = await hashPassword(password)
    const newUser = {
      id: Date.now().toString(),
      username,
      password_hash,
      is_admin: is_admin || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // TODO: Zamijeniti sa Supabase upitom
    // const { data, error } = await supabase.from('users').insert([newUser]).select()

    users.push(newUser)

    const { password_hash: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
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

    // TODO: Zamijeniti sa Supabase upitom
    // const { error } = await supabase.from('users').delete().eq('id', userId)

    const index = users.findIndex((u) => u.id === userId)
    if (index === -1) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    users.splice(index, 1)

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

