import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const hasSupabaseConfig = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase') &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase')

const supabase = hasSupabaseConfig ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null

export async function PUT(request: NextRequest) {
  try {
    const { userId, is_admin, is_editor, requestingUserId } = await request.json()

    if (!requestingUserId) {
      return NextResponse.json(
        { error: 'Niste autentifikovani' },
        { status: 401 }
      )
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database nije konfigurisan' },
        { status: 500 }
      )
    }

    // Provjeri da li je requesting user zaista admin
    const { data: requestingUser, error: authError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', requestingUserId)
      .single()

    if (authError || !requestingUser || !requestingUser.is_admin) {
      return NextResponse.json(
        { error: 'Nemate admin privilegije' },
        { status: 403 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID je obavezan' },
        { status: 400 }
      )
    }

    // Update role
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_admin: is_admin || false,
        is_editor: is_editor || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Rola uspješno ažurirana' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json(
      { error: 'Greška pri ažuriranju role' },
      { status: 500 }
    )
  }
}

