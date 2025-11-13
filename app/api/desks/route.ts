import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Privremeni in-memory storage (fallback)
let desksMemory: any[] = []

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
      return NextResponse.json({ desks: desksMemory }, { status: 200 })
    }

    const { data: desks, error } = await supabase
      .from('desk_elements')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ desks }, { status: 200 })
  } catch (error) {
    console.error('Get desks error:', error)
    return NextResponse.json(
      { error: 'Greška pri dohvaćanju stolova' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { x, y, width, height, desk_number, status } = await request.json()

    if (x === undefined || y === undefined || !desk_number) {
      return NextResponse.json(
        { error: 'Svi podaci su obavezni' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const newDesk = {
        id: Date.now().toString(),
        x,
        y,
        width: width || 80,
        height: height || 80,
        desk_number,
        status: status || 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      desksMemory.push(newDesk)
      return NextResponse.json({ success: true, desk: newDesk }, { status: 201 })
    }

    const { data, error } = await supabase
      .from('desk_elements')
      .insert([{
        x,
        y,
        width: width || 80,
        height: height || 80,
        desk_number,
        status: status || 'available',
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        desk: data,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create desk error:', error)
    return NextResponse.json(
      { error: 'Greška pri kreiranju stola' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, x, y, width, height, desk_number, status } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'ID stola je obavezan' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const index = desksMemory.findIndex((d) => d.id === id)
      if (index === -1) {
        return NextResponse.json({ error: 'Stol nije pronađen' }, { status: 404 })
      }
      
      desksMemory[index] = {
        ...desksMemory[index],
        x: x !== undefined ? x : desksMemory[index].x,
        y: y !== undefined ? y : desksMemory[index].y,
        width: width !== undefined ? width : desksMemory[index].width,
        height: height !== undefined ? height : desksMemory[index].height,
        desk_number: desk_number || desksMemory[index].desk_number,
        status: status || desksMemory[index].status,
        updated_at: new Date().toISOString(),
      }
      
      return NextResponse.json({ success: true, desk: desksMemory[index] }, { status: 200 })
    }

    const updateData: any = {}
    if (x !== undefined) updateData.x = x
    if (y !== undefined) updateData.y = y
    if (width !== undefined) updateData.width = width
    if (height !== undefined) updateData.height = height
    if (desk_number) updateData.desk_number = desk_number
    if (status) updateData.status = status

    const { data, error } = await supabase
      .from('desk_elements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Stol nije pronađen' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        desk: data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update desk error:', error)
    return NextResponse.json(
      { error: 'Greška pri ažuriranju stola' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deskId = searchParams.get('id')

    if (!deskId) {
      return NextResponse.json(
        { error: 'ID stola je obavezan' },
        { status: 400 }
      )
    }

    if (!supabase) {
      // Fallback: In-memory storage
      const index = desksMemory.findIndex((d) => d.id === deskId)
      if (index === -1) {
        return NextResponse.json({ error: 'Stol nije pronađen' }, { status: 404 })
      }
      desksMemory.splice(index, 1)
      return NextResponse.json({ success: true, message: 'Stol uspješno obrisan' }, { status: 200 })
    }

    const { error } = await supabase
      .from('desk_elements')
      .delete()
      .eq('id', deskId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: 'Stol uspješno obrisan' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete desk error:', error)
    return NextResponse.json(
      { error: 'Greška pri brisanju stola' },
      { status: 500 }
    )
  }
}

