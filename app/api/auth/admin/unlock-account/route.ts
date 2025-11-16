import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(request: NextRequest) {
  try {
    const { adminId, targetUserId } = await request.json()

    // Validacija inputa
    if (!adminId || !targetUserId) {
      return NextResponse.json(
        { error: 'Admin ID i Target User ID su obavezni' },
        { status: 400 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database nije konfigurisan' },
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
      .select('id, username, locked')
      .eq('id', targetUserId)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json(
        { error: 'Korisnik nije pronađen' },
        { status: 404 }
      )
    }

    // Provjeri da li je account zapravo lockovan
    if (!targetUser.locked) {
      return NextResponse.json(
        { error: 'Account nije zaključan' },
        { status: 400 }
      )
    }

    // Unlock account i resetuj failed attempts
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        locked: false,
        failed_login_attempts: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Unlock account error:', updateError)
      return NextResponse.json(
        { error: 'Greška pri otključavanju accounta' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Account korisnika "${targetUser.username}" je uspješno otključan` 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Admin unlock account error:', error)
    return NextResponse.json(
      { error: 'Došlo je do greške pri otključavanju accounta' },
      { status: 500 }
    )
  }
}

