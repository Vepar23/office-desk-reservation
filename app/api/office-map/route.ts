import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Privremeni in-memory storage (fallback)
let officeMapMemory: any = null

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

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      // Fallback: In-memory storage
      return NextResponse.json({ officeMap: officeMapMemory }, { status: 200 })
    }

    const { data, error } = await supabase
      .from('office_map')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, koji je validan slučaj
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ officeMap: data }, { status: 200 })
  } catch (error) {
    console.error('Get office map error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju mape ureda' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image_url, requestingUserId } = await request.json()

    // 🔒 SECURITY: Admin authorization check
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

    if (!image_url) {
      return NextResponse.json(
        { error: 'URL slike je obavezan' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      officeMapMemory = {
        id: '1',
        image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return NextResponse.json({ success: true, officeMap: officeMapMemory }, { status: 201 })
    }

    // Prvo provjerimo da li već postoji mapa
    const { data: existing } = await supabase
      .from('office_map')
      .select('id')
      .limit(1)
      .single()

    let result

    if (existing) {
      // Ažuriraj postojeću mapu
      const { data, error } = await supabase
        .from('office_map')
        .update({ image_url })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    } else {
      // Kreiraj novu mapu
      const { data, error } = await supabase
        .from('office_map')
        .insert([{ image_url }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json(
      {
        success: true,
        officeMap: result,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload office map error:', error)
    return NextResponse.json(
      { error: 'Greška pri uploadu mape ureda' },
      { status: 500 }
    )
  }
}

