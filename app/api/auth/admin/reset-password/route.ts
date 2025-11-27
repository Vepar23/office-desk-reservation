import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashPassword, validatePassword } from '@/lib/auth'

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

export async function POST(request: NextRequest) {
  try {
    const { adminId, targetUserId, newPassword } = await request.json()

    // Validacija inputa
    if (!adminId || !targetUserId || !newPassword) {
      return NextResponse.json(
        { error: 'Svi podaci su obavezni' },
        { status: 400 }
      )
    }

    // Validacija nove lozinke
    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: 'Nova lozinka mora imati najmanje 6 znakova' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Baza podataka nije konfigurirana' },
        { status: 500 }
      )
    }

    // Provjeri da li je admin zaista admin
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', adminId)
      .single()

    if (adminError || !admin || !admin.is_admin) {
      return NextResponse.json(
        { error: 'Nemate admin privilegije' },
        { status: 403 }
      )
    }

    // Provjeri da li target korisnik postoji
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    // Hash nova lozinka
    const newPasswordHash = await hashPassword(newPassword)

    // Update lozinku
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Reset password error:', updateError)
      return NextResponse.json(
        { error: 'Greška pri postavljanju nove lozinke' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Lozinka za korisnika "${targetUser.username}" je uspješno postavljena` 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin reset password error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške pri postavljanju nove lozinke' },
      { status: 500 }
    )
  }
}

