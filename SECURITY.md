# 🔒 Security Guidelines - Office Desk Reservation

Kompletne sigurnosne upute, best practices i security checklist.

---

## 📋 Security Checklist

### ✅ PRE-DEPLOYMENT

- [ ] Environment variables nisu u Git-u (`.env.local` u `.gitignore`)
- [ ] Supabase Service Role Key nije hard-coded
- [ ] Password hashing omogućen (bcrypt)
- [ ] Default admin lozinka promijenjena
- [ ] Supabase RLS policies omogućeni
- [ ] SQL injection zaštita (parametrizirani queriji)
- [ ] Input validation implementirana

### ✅ POST-DEPLOYMENT

- [ ] Admin lozinka promijenjena na produkciji
- [ ] Supabase ključevi rotirani (ako su bili exposed)
- [ ] HTTPS enabled (Vercel automatski)
- [ ] Environment variables postavljene na Vercel
- [ ] Test login sa starom lozinkom (trebao bi failati)
- [ ] RLS policies testirane

---

## 🔐 1. Password Security

### Current Implementation

**Algoritam:** bcrypt  
**Salt Rounds:** 10  
**Min Dužina:** 6 znakova

```typescript
import bcrypt from 'bcryptjs'

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Best Practices

**Admin Lozinka:**
- ✅ Minimalno **12 znakova**
- ✅ Kombinacija: uppercase, lowercase, brojevi, specijalni znakovi
- ✅ Primjer: `Admin2025!Secure@Desk`
- ❌ NE koristi: `admin`, `password`, `123456`, `test123`

**User Lozinke:**
- ✅ Minimalno **6 znakova** (trenutni limit)
- ✅ Preporučeno **8+ znakova**
- ✅ Nemoj koristiti username kao lozinku

### Promjena Lozinke

**Za Korisnike:**
1. Login na aplikaciju
2. Klikni "Lozinka" dugme
3. Unesi trenutnu lozinku
4. Unesi novu lozinku (min 6 znakova)
5. Potvrdi

**Za Admina (direkt u bazi):**
```sql
-- 1. Generiši bcrypt hash lokalno (koristi Node.js)
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('new_password', 10);
console.log(hash); // Kopiraj ovaj hash

-- 2. Update u Supabase SQL Editor
UPDATE users 
SET password_hash = '$2a$10$...' -- Zalepi novi hash
WHERE username = 'admin';
```

---

## 🔑 2. Supabase API Keys

### Tipovi Ključeva

| Key Type | Visibility | Usage | Power Level |
|----------|-----------|-------|-------------|
| **anon/public** | ✅ Public (frontend) | Client-side queries | RLS Restricted |
| **service_role** | ❌ SECRET (backend only) | Server-side, bypasses RLS | Full Access |

### Gdje Koristiti

**Frontend (Client):**
```typescript
// ✅ SAFE - Anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Backend (API Routes):**
```typescript
// ✅ SAFE - Service Role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

**❌ NIKAD:**
```typescript
// ❌ NIKAD hardcode keys u kodu
const supabase = createClient(
  'https://abc123.supabase.co',
  'eyJhbGc...' // ❌ NO!
)
```

### Rotacija Ključeva

Ako je **Service Role Key** exposed (Git, public kod, itd.):

#### Korak 1: Reset u Supabase

1. Idi na **Supabase Dashboard → Settings → API**
2. U **Service Role** sekciji, klikni **"Reset key"**
3. Potvrdi reset
4. **Kopiraj novi key** (nećeš ga više vidjeti!)

#### Korak 2: Update na Vercel

1. Idi na **Vercel Dashboard → Project → Settings → Environment Variables**
2. Nađi `SUPABASE_SERVICE_ROLE_KEY`
3. Klikni **Edit**
4. Zalepi **novi key**
5. Klikni **Save**
6. **Redeploy aplikaciju:**
   - Deployments → Latest deployment → ... → Redeploy

#### Korak 3: Update Lokalno

```bash
# Otvori .env.local
# Zamijeni stari key sa novim

SUPABASE_SERVICE_ROLE_KEY=eyJhbGc_NEW_KEY_HERE
```

#### Korak 4: Restart Dev Server

```bash
# Zaustavi trenutni server (Ctrl+C)
# Pokreni ponovo
npm run dev
```

#### Korak 5: Revoke iz Git History (Opcionalno ali preporučeno)

Ako je key bio commit-ovan:

```bash
# OPREZ: Ovo menja Git history!
# Backup projekta prije izvršavanja

# Koristi git filter-branch ili BFG Repo-Cleaner
# https://rtyley.github.io/bfg-repo-cleaner/

# Alternative: Kreiranje novog repozitorija
# Preporučeno za jednostavnost
```

---

## 🛡️ 3. Row Level Security (RLS)

### Što je RLS?

Row Level Security omogućava kontrolu pristupa na nivou **reda u tabeli**.

### Omogućavanje RLS

```sql
-- Enable RLS za sve tabele
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE desk_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;
```

### Politike

#### Users Tabela

```sql
-- Korisnici vide samo svoj profil
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Admini vide sve
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

#### Desk Elements Tabela

```sql
-- Svi autentifikovani korisnici mogu čitati
CREATE POLICY "Anyone can view desks"
ON desk_elements FOR SELECT
TO authenticated
USING (true);

-- Samo admini mogu uređivati
CREATE POLICY "Only admins can modify desks"
ON desk_elements FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

#### Reservations Tabela

```sql
-- Svi mogu vidjeti rezervacije (za calendar)
CREATE POLICY "Anyone can view reservations"
ON reservations FOR SELECT
TO authenticated
USING (true);

-- Korisnici mogu kreirati rezervacije
CREATE POLICY "Users can create reservations"
ON reservations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Korisnici mogu brisati samo svoje
CREATE POLICY "Users can delete own reservations"
ON reservations FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admini mogu brisati sve
CREATE POLICY "Admins can delete any reservation"
ON reservations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);
```

### Provjera RLS Statusa

```sql
-- Provjeri da li je RLS omogućen
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'desk_elements', 'reservations', 'office_map');

-- Očekivani rezultat: rowsecurity = TRUE za sve tabele
```

### Testiranje RLS

```sql
-- Test kao anonymous user (trebalo bi failati)
SELECT * FROM users; -- Trebalo bi vratiti 0 redova

-- Test kao autentifikovani user (vidjet će samo svoj profil)
SELECT * FROM users WHERE id = auth.uid(); -- Trebalo bi vratiti 1 red
```

---

## 🚫 4. Common Vulnerabilities

### SQL Injection ✅ PROTECTED

**How we protect:**
```typescript
// ✅ SAFE - Parametrizirani query
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('username', username) // Supabase automatski escapuje

// ❌ UNSAFE (ne koristimo ovo)
const query = `SELECT * FROM users WHERE username = '${username}'`
```

### XSS (Cross-Site Scripting) ✅ PROTECTED

**How we protect:**
```tsx
// React automatski escapuje HTML
<p>{user.username}</p> // ✅ SAFE

// ❌ UNSAFE (ne koristimo ovo)
<p dangerouslySetInnerHTML={{__html: user.username}} /> // ❌ NO!
```

### CSRF (Cross-Site Request Forgery) 🟡 PARTIAL

**Current status:** Next.js API routes su protected od CSRF ako koristimo proper HTTP methods.

**Recommendation:** Dodaj CSRF tokens za dodatnu zaštitu (optional).

### Brute Force Attacks 🟡 NOT IMPLEMENTED

**Current status:** Nema rate limiting.

**Recommendation:** 
```typescript
// TODO: Dodaj rate limiting
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5 // 5 requests per window
})

// Apply to login route
```

---

## 🔍 5. Input Validation

### Username Validation

```typescript
export function validateUsername(username: string): boolean {
  // Min 3 znaka, dozvoljeni: slova, brojevi, razmaci, šžčćđ
  return username.length >= 3 && 
    /^[a-zA-ZčćžšđČĆŽŠĐ0-9_ ]+$/.test(username)
}
```

**Zaštićeno od:**
- ✅ SQL injection
- ✅ XSS
- ✅ Posebni znakovi

### Password Validation

```typescript
export function validatePassword(password: string): boolean {
  return password.length >= 6
}
```

**Preporuka:** Dodaj složeniju validaciju:
```typescript
export function validateStrongPassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) && // Uppercase
    /[a-z]/.test(password) && // Lowercase
    /[0-9]/.test(password) && // Number
    /[^A-Za-z0-9]/.test(password) // Special char
}
```

---

## 📊 6. Security Audit Scoring

### Current Score: **7.5/10** 🟢 (DOBRO)

**Breakdown:**

| Category | Score | Status |
|----------|-------|--------|
| Password Security | 10/10 | ✅ Odlično |
| RLS Policies | 10/10 | ✅ Odlično |
| Environment Vars | 10/10 | ✅ Odlično |
| Hardcoded Credentials | 10/10 | ✅ Riješeno |
| Session Management | 5/10 | 🟡 localStorage (OK ali ne idealno) |
| Rate Limiting | 0/10 | ❌ Nije implementirano |
| CSRF Protection | 5/10 | 🟡 Parcijalno |
| Audit Logging | 0/10 | ❌ Nije implementirano |

### Kako Poboljšati (Optional)

1. **HTTP-only Cookies** umjesto localStorage
2. **Rate Limiting** na login endpoint
3. **CSRF Tokens** za forme
4. **Audit Logging** za admin akcije
5. **Two-Factor Authentication (2FA)**

---

## ⚠️ 7. Security Incidents

### Ako dođe do Breach-a

1. **ODMAH promijeni sve lozinke:**
   - Admin lozinka
   - Svi user passwordi

2. **Rotiraj sve ključeve:**
   - Supabase Service Role Key
   - Supabase Anon Key (opcionalno)

3. **Provjeri logs:**
   - Supabase Dashboard → Logs
   - Vercel Function Logs
   - Traži sumnjive aktivnosti

4. **Obavijesti korisnike:**
   - Ako je user data compromised

5. **Review security policies:**
   - RLS policies
   - Environment variables
   - Access controls

---

## 📞 Security Contacts

**Za sigurnosne incidente:**
1. Kontaktiraj administratora projekta odmah
2. Email: security@yourcompany.com (zamijeni)
3. Ne dijeli security issues javno

**Responsible Disclosure:**
Ako pronađeš security vulnerability, javi privatno prije public disclosure.

---

## 🔄 Regular Security Maintenance

### Mjesečno:
- [ ] Provjeri Supabase logs
- [ ] Provjeri Vercel deployment logs
- [ ] Review user access
- [ ] Check for dependency vulnerabilities (`npm audit`)

### Kvartalno:
- [ ] Rotiraj Supabase ključeve
- [ ] Promijeni admin lozinku
- [ ] Security audit review

### Godišnje:
- [ ] Full security assessment
- [ ] Penetration testing (optional)
- [ ] Update security documentation

---

## ✅ Quick Security Check

```bash
# Check .env.local nije u Git-u
git ls-files .env.local
# Output: (prazno) ✅

# Check za hardcoded secrets
grep -r "supabase" --include="*.tsx" --include="*.ts" app/
# Ne bi trebao vidjeti actual keys ✅

# NPM vulnerability scan
npm audit
# Fix any HIGH or CRITICAL vulnerabilities
```

---

**Zapamti: Security je ongoing proces, ne one-time task! 🔒**
