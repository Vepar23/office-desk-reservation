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

// In-memory fallback
let exemptionsMemory: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!supabase) {
      // Fallback: In-memory storage
      let filteredExemptions = [...exemptionsMemory]
      if (date) {
        filteredExemptions = filteredExemptions.filter((e) => e.date === date)
      }
      return NextResponse.json({ exemptions: filteredExemptions }, { status: 200 })
    }

    let query = supabase
      .from('desk_exemptions')
      .select('*')

    if (date) {
      query = query.eq('date', date)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exemptions: data }, { status: 200 })
  } catch (error) {
    console.error('Get exemptions error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju exemptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { desk_id, date, created_by } = await request.json()

    if (!desk_id || !date) {
      return NextResponse.json(
        { error: 'Desk ID i datum su obavezni' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const existingExemption = exemptionsMemory.find(
        (e) => e.desk_id === desk_id && e.date === date
      )

      if (existingExemption) {
        return NextResponse.json(
          { error: 'Exemption već postoji za ovaj datum' },
          { status: 409 }
        )
      }

      const newExemption = {
        id: Date.now().toString(),
        desk_id,
        date,
        created_by: created_by || null,
        created_at: new Date().toISOString(),
      }

      exemptionsMemory.push(newExemption)

      return NextResponse.json(
        { success: true, exemption: newExemption },
        { status: 201 }
      )
    }

    // Check if exemption already exists
    const { data: existingExemption } = await supabase
      .from('desk_exemptions')
      .select('*')
      .eq('desk_id', desk_id)
      .eq('date', date)
      .single()

    if (existingExemption) {
      return NextResponse.json(
        { error: 'Ovo mjesto je već oslobođeno za ovaj dan' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('desk_exemptions')
      .insert([{ desk_id, date, created_by }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, exemption: data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create exemption error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju exemption' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deskId = searchParams.get('desk_id')
    const date = searchParams.get('date')

    if (!deskId || !date) {
      return NextResponse.json(
        { error: 'Desk ID i datum su obavezni' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const index = exemptionsMemory.findIndex(
        (e) => e.desk_id === deskId && e.date === date
      )
      
      if (index === -1) {
        return NextResponse.json(
          { error: 'Exemption nije pronađen' },
          { status: 404 }
        )
      }

      exemptionsMemory.splice(index, 1)

      return NextResponse.json(
        { success: true, message: 'Exemption uspješno obrisan' },
        { status: 200 }
      )
    }

    const { error } = await supabase
      .from('desk_exemptions')
      .delete()
      .eq('desk_id', deskId)
      .eq('date', date)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Exemption uspješno obrisan' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete exemption error:', error)
    return NextResponse.json(
      { error: 'Greška pri brisanju exemption' },
      { status: 500 }
    )
  }
}

