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

// 🔒 RATE LIMITING: In-memory storage for login attempts
interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil?: number
}

const loginAttempts = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5
const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes

function getClientIdentifier(request: NextRequest): string {
  // Use IP address or X-Forwarded-For header
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwardedFor?.split(',')[0] || realIp || 'unknown'
}

function checkRateLimit(clientId: string): { allowed: boolean; remainingAttempts?: number; blockedUntil?: number } {
  const now = Date.now()
  const entry = loginAttempts.get(clientId)

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  // Check if blocked
  if (entry.blockedUntil && entry.blockedUntil > now) {
    return { allowed: false, blockedUntil: entry.blockedUntil }
  }

  // Check if window has expired
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.delete(clientId)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  // Check if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_DURATION
    return { allowed: false, blockedUntil: entry.blockedUntil }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - entry.attempts }
}

function recordAttempt(clientId: string) {
  const now = Date.now()
  const entry = loginAttempts.get(clientId)

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(clientId, {
      attempts: 1,
      firstAttempt: now,
    })
  } else {
    entry.attempts++
  }
}

function resetAttempts(clientId: string) {
  loginAttempts.delete(clientId)
}

export async function POST(request: NextRequest) {
  try {
    // 🔒 RATE LIMITING: Check rate limit
    const clientId = getClientIdentifier(request)
    const rateCheck = checkRateLimit(clientId)

    if (!rateCheck.allowed) {
      const minutesLeft = rateCheck.blockedUntil 
        ? Math.ceil((rateCheck.blockedUntil - Date.now()) / 1000 / 60)
        : 15
      
      return NextResponse.json(
        { 
          error: `Previše neuspjelih pokušaja. Pokušajte ponovo za ${minutesLeft} minuta.`,
          blockedUntil: rateCheck.blockedUntil 
        },
        { status: 429 }
      )
    }

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
      // 🔒 RATE LIMITING: Record failed attempt
      recordAttempt(clientId)

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

        const remaining = rateCheck.remainingAttempts ? rateCheck.remainingAttempts - 1 : 0
        return NextResponse.json(
          { 
            error: 'Neispravno korisničko ime ili lozinka',
            attemptsRemaining: 5 - newFailedAttempts,
            rateLimitRemaining: remaining
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
    // 🔒 RATE LIMITING: Reset attempts on successful login
    resetAttempts(clientId)

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

