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

    // VAŽNO: Hardcoded default admin pristup
    if (username === 'admin' && password === 'test123') {
      // Pokušaj da nađeš ili kreiraj admin korisnika u Supabase
      if (supabase) {
        try {
          // Provjeri da li admin postoji u bazi
          const { data: existingAdmin, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('username', 'admin')
            .single()

          if (existingAdmin) {
            // Admin već postoji, proveri lozinku
            const isValid = await verifyPassword('test123', existingAdmin.password_hash)
            if (isValid) {
              const { password_hash, ...adminWithoutPassword } = existingAdmin
              return NextResponse.json({
                success: true,
                user: adminWithoutPassword,
              }, { status: 200 })
            }
          }

          // Admin ne postoji ili lozinka ne odgovara - kreiraj novog
          const password_hash = await hashPassword('test123')

          const { data: newAdmin, error: createError } = await supabase
            .from('users')
            .insert([{
              username: 'admin',
              password_hash: password_hash,
              is_admin: true,
            }])
            .select()
            .single()

          if (!createError && newAdmin) {
            const { password_hash: _, ...adminWithoutPassword } = newAdmin
            return NextResponse.json({
              success: true,
              user: adminWithoutPassword,
            }, { status: 200 })
          }
        } catch (error) {
          console.log('Admin auto-create error:', error)
          // Nastavi sa fallback-om
        }
      }

      // Fallback: vraća in-memory admin (bez UUID validacije)
      const adminUser = {
        id: 'admin-default',
        username: 'admin',
        is_admin: true,
      }

      return NextResponse.json({
        success: true,
        user: adminUser,
      }, { status: 200 })
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
      return NextResponse.json(
        { error: 'Neispravno korisničko ime ili lozinka' },
        { status: 401 }
      )
    }

    // Ukloni hash lozinke prije slanja
    const { password_hash, ...userWithoutPassword } = user

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

