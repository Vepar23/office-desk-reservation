# 🔐 Security Audit Report - Office Desk Reservation System

**Datum:** 16. Novembar 2025  
**Status:** 🟡 Moderate Risk - Action Required  
**Verzija Aplikacije:** 1.4

---

## 📋 Executive Summary

Aplikacija je **javno dostupna** na Vercel-u i ima nekoliko **kritičnih i srednjih sigurnosnih rizika** koji zahtevaju **hitnu akciju**.

### ⚠️ Kritični Problemi (HITNO):
1. **Exposed Supabase Credentials** u Git istoriji ✅ (Djelimično Riješeno)
2. **Hardcoded Default Admin Password** (`test123`) 🔴 (Treba Promijeniti)
3. **Nedostaju Supabase RLS Policies** 🔴 (Kritično)

### 🟡 Srednji Problemi:
4. Nedostaje Rate Limiting na login endpoint-u
5. Nedostaje CSRF zaštita
6. Session management je samo localStorage (ne HTTP-only cookies)

### ✅ Dobro:
- Password hashing sa bcrypt
- Environment varijable nisu u kodu
- `.gitignore` pravilno konfigurisan

---

## 🔴 KRITIČNI PROBLEMI

### 1. Exposed Supabase Credentials (GitHub History)

**Status:** ✅ Djelimično Riješeno  
**Rizik:** 🔴 KRITIČAN  
**Action Required:** HITNO

**Problem:**
- Supabase ključevi su bili commit-ovani u `GITHUB_VERCEL_DEPLOYMENT.md`
- GitHub je detektovao exposed secrets
- **Iako smo uklonili iz current fajla, oni su JOŠ UVEK u Git istoriji!**

**Rešenje:**
1. ✅ Uklonili smo credentials iz dokumentacije
2. ⚠️ **MORA SE:** Rotirati Supabase API ključeve ODMAH
3. ⚠️ **MORA SE:** Očistiti Git istoriju (opcionalno, ali preporučeno)

**Kako Rotirati Ključeve:**
Pratite instrukcije u `SECURITY_ROTATE_KEYS.md`

**Kako Očistiti Git Istoriju (Napredni):**
```bash
# PAŽNJA: Ovo menja Git istoriju!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch GITHUB_VERCEL_DEPLOYMENT.md" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

---

### 2. Hardcoded Default Admin Password

**Status:** 🔴 AKTIVAN PROBLEM  
**Rizik:** 🔴 KRITIČAN (Production)  
**Lokacija:** `app/api/auth/login/route.ts:39`

**Problem:**
```typescript
if (username === 'admin' && password === 'test123') {
  // Hardcoded admin pristup
}
```

**Rizik:**
- **SVAKO** može da se uloguje kao admin sa `admin/test123`
- Admin ima **pun pristup** svim funkcijama
- Može **brisati korisnike, stolove, rezervacije**
- Može **upload-ovati nove fajlove**

**HITNO RJEŠENJE:**

**Opcija A: Promenite Admin Lozinku (Brzo)**

1. Ulogujte se kao admin na Vercel app
2. Kliknite na "Lozinka" dugme u header-u
3. Promenite lozinku na nešto jako (npr. `A8x!mK9#pL2@qR7$`)
4. Nakon toga, **obrišite hardcoded proveru** iz koda:

```typescript
// UKLONITE ovo iz app/api/auth/login/route.ts:
if (username === 'admin' && password === 'test123') {
  // ...ceo ovaj blok...
}
```

**Opcija B: Environment Varijabla (Najbolje)**

Dodajte environment varijablu `ADMIN_PASSWORD` na Vercel i promenite kod:

```typescript
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'test123'

if (username === 'admin' && password === DEFAULT_ADMIN_PASSWORD) {
  // ...
}
```

---

### 3. Nedostaju Supabase Row Level Security (RLS) Policies

**Status:** 🔴 KRITIČAN  
**Rizik:** 🔴 VISOK - Data Breach Rizik

**Problem:**
Supabase tabele **nemaju RLS policies**, što znači:
- **Bilo ko** sa anon key-om može da čita SVE podatke
- **Bilo ko** može da menja tuđe rezervacije
- **Bilo ko** može da briše korisnike

**HITNO: Omogućite RLS Policies**

Izvršite sledeći SQL u Supabase SQL Editor-u:

```sql
-- 1. Omogući RLS na svim tabelama
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;

-- 2. USERS tabela - samo admin može da vidi i menja
CREATE POLICY "Admin može sve sa users" ON users
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 3. DESKS tabela - svi mogu da vide, samo admin može da menja
CREATE POLICY "Svi mogu da vide desks" ON desks
  FOR SELECT
  USING (true);

CREATE POLICY "Admin može da menja desks" ON desks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. RESERVATIONS tabela - korisnici vide svoje, admin vidi sve
CREATE POLICY "Korisnici vide svoje rezervacije" ON reservations
  FOR SELECT
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Korisnici kreiraju svoje rezervacije" ON reservations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Korisnici brišu svoje rezervacije" ON reservations
  FOR DELETE
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 5. OFFICE_MAP tabela - svi mogu da vide, samo admin može da menja
CREATE POLICY "Svi mogu da vide office map" ON office_map
  FOR SELECT
  USING (true);

CREATE POLICY "Admin može da menja office map" ON office_map
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

**⚠️ VAŽNO:** Ovo trenutno **NEĆE raditi** jer ne koristite Supabase Auth!

**Rešenje:** Pošto koristite custom authentication, RLS policies moraju koristiti `service_role_key` ili prilagoditi policies.

**Alternativno Rešenje - Backend Validation:**

Dodajte provere u svaki API endpoint:

```typescript
// Primer: app/api/reservations/route.ts
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const reservationId = searchParams.get('id')
  const userId = searchParams.get('userId') // Iz session-a
  
  // Dohvati rezervaciju
  const reservation = await getReservation(reservationId)
  
  // Proveri da li korisnik ima pravo da obriše
  if (reservation.user_id !== userId && !user.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Nastavi sa brisanjem...
}
```

---

## 🟡 SREDNJI PROBLEMI

### 4. Nedostaje Rate Limiting

**Rizik:** 🟡 SREDNJI - Brute Force Attack

**Problem:**
Login endpoint nema rate limiting - napadač može da proba hiljade lozinki.

**Rešenje:** Dodajte rate limiting middleware ili koristite Vercel Edge Config:

```typescript
// Jednostavno IP-based rate limiting
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minuta

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  const attempts = loginAttempts.get(ip)
  
  if (attempts) {
    if (now - attempts.lastAttempt < WINDOW_MS) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return NextResponse.json(
          { error: 'Previše pokušaja. Pokušajte za 15 minuta.' },
          { status: 429 }
        )
      }
      attempts.count++
    } else {
      attempts.count = 1
      attempts.lastAttempt = now
    }
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
  }
  
  // Nastavi sa login logikom...
}
```

---

### 5. Session Management - localStorage

**Rizik:** 🟡 SREDNJI - XSS Vulnerability

**Problem:**
User session je sačuvan u `localStorage` koji je podložan XSS napadima.

**Rešenje:** Koristite HTTP-only cookies:

```typescript
// app/api/auth/login/route.ts
const response = NextResponse.json({ success: true, user })

response.cookies.set('session', encryptedSessionToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7 dana
})

return response
```

---

### 6. Nedostaje CSRF Zaštita

**Rizik:** 🟡 NIZAK-SREDNJI

**Rešenje:** Dodajte CSRF token za POST/DELETE requests.

---

## ✅ DOBRO IMPLEMENTIRANO

### ✓ Password Hashing
- Koristi `bcryptjs` sa 10 rounds
- Lozinke nisu nikad sačuvane u plain text

### ✓ Environment Variables
- Kredencijali nisu hardcoded u kodu (osim default admin)
- `.env.local` je u `.gitignore`

### ✓ HTTPS na Produkciji
- Vercel automatski forceuje HTTPS

---

## 📝 ACTION PLAN (Prioritet)

### 🔴 HITNO (0-24h):

1. **Rotirajte Supabase API ključeve**
   - Pratite `SECURITY_ROTATE_KEYS.md`
   - Ažurirajte na Vercel-u i lokalno
   
2. **Promenite Admin Lozinku**
   - Ulogujte se i promenite preko app-a
   - Ili dodajte `ADMIN_PASSWORD` env var

3. **Dodajte Backend Validation**
   - Provera da korisnik može da obriše samo svoje rezervacije
   - Provera da samo admin može da menja desks/users

### 🟡 Kratak Rok (1-7 dana):

4. **Dodajte Rate Limiting na login**
5. **Implementirajte HTTP-only cookies** umesto localStorage
6. **Dodajte logging** za security events

### 🟢 Dugi Rok (1-4 nedelje):

7. **Dodajte 2FA za admin naloge**
8. **Implementirajte audit log**
9. **Dodajte monitoring** (Sentry, LogRocket)

---

## 🧪 KAKO TESTIRATI SIGURNOST

### Test 1: Pokušajte da pristupite tuđim podacima

```bash
# Logirajte se kao obican user
# Pokušajte da pristupite /api/users endpoint-u
curl https://your-app.vercel.app/api/users

# Ako vidite sve korisnike - PROBLEM!
```

### Test 2: Pokušajte Brute Force

```bash
# Pokušajte 100 puta login sa pogrešnom lozinkom
for i in {1..100}; do
  curl -X POST https://your-app.vercel.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong'$i'"}'
done

# Ako nema rate limiting - PROBLEM!
```

---

## 📊 Security Score: 4/10

**Breakdown:**
- Authentication: 6/10 (bcrypt ✅, hardcoded admin ❌)
- Authorization: 2/10 (bez RLS ❌, bez backend checks ❌)
- Data Protection: 5/10 (HTTPS ✅, localStorage ⚠️)
- API Security: 3/10 (bez rate limiting ❌)
- Secrets Management: 5/10 (exposed in git ❌)

**Target:** 8+/10 nakon implementacije svih preporuka

---

## 📚 Dodatni Resursi

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Vercel Security](https://vercel.com/docs/security)

---

**⚠️ KRITIČNO: Nemojte ignorisati ove sigurnosne probleme!**

Aplikacija je trenutno **ranjiva** i može biti **kompromitovana**.
Pratite Action Plan i implementirajte popravke **što pre**!

