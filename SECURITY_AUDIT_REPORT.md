# 🔒 SIGURNOSNI AUDIT IZVJEŠTAJ
**Datum:** 21. Novembar 2025  
**Aplikacija:** Office Desk Reservation System  
**Vercel:** https://vercel.com/dashboard  
**GitHub:** https://github.com/Vepar23/office-desk-reservation  
**Supabase:** https://supabase.com/dashboard

---

## 📊 UKUPAN SIGURNOSNI SKOR: **6.5/10** 🟡

**Status:** SREDNJI NIVO - Zahtijeva hitne izmjene

---

## ❌ KRITIČNI PROBLEMI (Hitno riješiti!)

### 1. ⚠️ NEDOSTAJE ADMIN AUTORIZACIJA U API ENDPOINTS

**Kritičnost:** 🔴 VISOKA  
**Pogođeni fajlovi:**
- `app/api/users/route.ts` - GET, POST, DELETE
- `app/api/desks/route.ts` - POST, PUT, DELETE
- `app/api/office-map/route.ts` - POST

**Problem:**  
API endpoints za upravljanje korisnicima, stolovima i office map-om NEMAJU provjeru da li je korisnik admin. Bilo ko može slati zahtjeve direktno na ove endpoint-e i:
- Kreirati nove admin korisnike
- Brisati korisnike
- Mijenjati desktop elemente
- Upload-ovati nove office map slike

**Primjer napada:**
```bash
# Bilo ko može kreirati admin korisnika:
curl -X POST https://your-app.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","password":"123456","is_admin":true}'
```

**Rješenje:**  
Dodaj admin provjeru u svaki API endpoint:

```typescript
// Primjer za /api/users/route.ts
export async function POST(request: NextRequest) {
  try {
    const { username, password, is_admin, requestingUserId } = await request.json()

    // 🔒 DODAJ OVO - Admin check
    if (!requestingUserId) {
      return NextResponse.json(
        { error: 'Niste autentifikovani' },
        { status: 401 }
      )
    }

    // Provjeri da li je requesting user zaista admin
    const { data: requestingUser } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', requestingUserId)
      .single()

    if (!requestingUser || !requestingUser.is_admin) {
      return NextResponse.json(
        { error: 'Nemate admin privilegije' },
        { status: 403 }
      )
    }

    // Nastavi sa normalno logikom...
  }
}
```

**Status:** ❌ NIJE IMPLEMENTIRANO

---

### 2. ⚠️ RATE LIMITING NIJE IMPLEMENTIRAN

**Kritičnost:** 🔴 VISOKA  
**Pogođeni endpoint:** `/api/auth/login`

**Problem:**  
Napadač može slati neograničen broj login pokušaja (brute force attack):
- 1000 pokušaja u sekundi
- Dictionary attacks
- Credential stuffing

**Trenutna zaštita:**  
Implementiran je account lockout nakon 5 neuspjelih pokušaja, ali to ne sprečava brute force napad.

**Rješenje:**  
Dodaj rate limiting:

```bash
npm install express-rate-limit
```

```typescript
// middleware.ts ili u login route
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 5, // Maksimalno 5 pokušaja
  message: 'Previše pokušaja logina. Pokušajte ponovo za 15 minuta.',
  standardHeaders: true,
  legacyHeaders: false,
})
```

**Status:** ❌ NIJE IMPLEMENTIRANO

---

### 3. ⚠️ NPM PAKETI SA POZNATIM RANJIVOSTIMA

**Kritičnost:** 🟡 SREDNJA  

**Pronađene ranjivosti:**
```
glob 10.2.0 - 10.4.5
Severity: high
glob CLI: Command injection via -c/--cmd executes matches with shell:true

js-yaml 4.0.0 - 4.1.0  
Severity: moderate
js-yaml has prototype pollution in merge (<<)
```

**Rješenje:**
```bash
npm audit fix
```

**Status:** ❌ NIJE RIJEŠENO

---

## 🟡 SREDNJI PROBLEMI

### 4. CSRF ZAŠTITA PARCIJALNO IMPLEMENTIRANA

**Kritičnost:** 🟡 SREDNJA

**Problem:**  
Next.js API routes nude bazičnu CSRF zaštitu preko SameSite cookies, ali aplikacija koristi localStorage umjesto cookies.

**Rješenje:**  
Preporučuje se prebacivanje sa localStorage na HTTP-only cookies:

```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  // Nakon uspješnog login-a
  const response = NextResponse.json({ success: true, user })
  
  // Postavi HTTP-only cookie
  response.cookies.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 dana
  })
  
  return response
}
```

**Status:** 🟡 KORISTI localStorage (manje sigurno)

---

### 5. AUDIT LOGGING NIJE IMPLEMENTIRAN

**Kritičnost:** 🟡 SREDNJA

**Problem:**  
Nema logovanja admin akcija:
- Ko je kreirao/obrisao korisnika
- Ko je promijenio office map
- Ko je oslobodio trajno rezervirana mjesta

**Rješenje:**  
Kreiraj `audit_logs` tabelu:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- 'user_created', 'user_deleted', etc.
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Status:** ❌ NIJE IMPLEMENTIRANO

---

## ✅ DOBRO IMPLEMENTIRANO

### 1. ✅ PASSWORD SECURITY - 10/10

**Implementacija:**
- ✅ bcrypt hashing sa 10 salt rounds
- ✅ Lozinke se nikad ne čuvaju u plain textu
- ✅ Password hash se nikad ne šalje klijentu
- ✅ Validacija minimum 6 znakova

**Code:**
```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10) // ✅ Secure
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash) // ✅ Secure
}
```

---

### 2. ✅ ENVIRONMENT VARIABLES - 10/10

**Implementacija:**
- ✅ `.env.local` je u `.gitignore`
- ✅ Environment variables nisu hardcoded u kodu
- ✅ Postoji `env.template` za onboarding
- ✅ `SUPABASE_SERVICE_ROLE_KEY` je secret (ne šalje se browseru)

**Provjera:**
```bash
# .gitignore sadrži:
.env*.local
.env

# ✅ PASS
```

---

### 3. ✅ ROW LEVEL SECURITY (RLS) - 10/10

**Implementacija:**
- ✅ RLS omogućen na svim tabelama
- ✅ Service role ima full access
- ✅ Policies su postavljene
- ✅ SQL injection zaštita (parametrizirani queriji)

**Provjera:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- ✅ Sve tabele imaju rowsecurity = TRUE
```

---

### 4. ✅ SECURITY HEADERS - 8/10

**Implementacija:**
```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY') // ✅
response.headers.set('X-Content-Type-Options', 'nosniff') // ✅
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin') // ✅
response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()') // ✅
```

**Nedostaju:**
- Content-Security-Policy
- Strict-Transport-Security

---

### 5. ✅ INPUT VALIDATION - 9/10

**Implementacija:**
```typescript
export function validateUsername(username: string): boolean {
  return username.length >= 3 && 
    /^[a-zA-ZčćžšđČĆŽŠĐ0-9_ ]+$/.test(username) // ✅ XSS protected
}

export function validatePassword(password: string): boolean {
  return password.length >= 6 // ✅ Minimum length
}
```

**Preporuka:** Dodaj kompleksniju validaciju lozinke.

---

### 6. ✅ ACCOUNT LOCKOUT - 10/10

**Implementacija:**
- ✅ Account se lockuje nakon 5 neuspjelih pokušaja
- ✅ Admin može unlockati accounte
- ✅ Failed attempts counter se resetuje nakon uspješnog login-a

---

## 🔍 SUPABASE KONFIGURACIJA

### ✅ Sigurnost Postavki

**Provjera:**
1. ✅ RLS omogućen na svim tabelama
2. ✅ Service Role Key nije u Git-u
3. ✅ API Keys su u environment variables
4. ✅ Database backups su omogućeni (automatski na Supabase)

**Preporuke:**
- [ ] Rotiraj API keys svaka 3 mjeseca
- [ ] Omogući database logging
- [ ] Postavi email notifikacije za security events

---

## 🔍 GITHUB KONFIGURACIJA

### ✅ Repository Sigurnost

**Provjera:**
```bash
git ls-files .env.local
# Output: (prazno) ✅

git log --all -- .env
# Output: (prazno) ✅
```

**Status:**
- ✅ `.env` fajlovi nisu u Git historiji
- ✅ Sensitive data nije commit-ovan
- ✅ `.gitignore` je pravilno postavljen

**Preporuke:**
- [ ] Omogući GitHub branch protection rules
- [ ] Zahtijevaj code review prije merging-a
- [ ] Omogući Dependabot security alerts

---

## 🔍 VERCEL DEPLOYMENT

### 🟡 Security Checklist

**Provjera:**
- [ ] Environment variables su postavljene
- [ ] HTTPS je omogućen (automatski na Vercel)
- [ ] Custom domain ima SSL certifikat
- [ ] Preview deployments su zaštićeni password-om (preporuka)

**Preporuke:**
- [ ] Omogući Vercel Firewall (Pro plan)
- [ ] Postavi custom error pages
- [ ] Ograniči geografski pristup (ako nije potreban globalni)

---

## 📋 HITNE AKCIJE (U NAREDNIH 24H)

### 1. Dodaj Admin Provjeru u API Endpoints
**Prioritet:** 🔴 KRITIČNO  
**Trajanje:** 2h  
**Fajlovi:**
- `app/api/users/route.ts`
- `app/api/desks/route.ts`
- `app/api/office-map/route.ts`

### 2. Implementiraj Rate Limiting
**Prioritet:** 🔴 KRITIČNO  
**Trajanje:** 1h  
**Fajlovi:**
- `app/api/auth/login/route.ts`

### 3. Fix NPM Vulnerabilities
**Prioritet:** 🟡 SREDNJE  
**Trajanje:** 15min  
```bash
npm audit fix
```

---

## 📋 KRATKOROČNE AKCIJE (U NAREDNIH 7 DANA)

### 4. Implementiraj Audit Logging
**Prioritet:** 🟡 SREDNJE  
**Trajanje:** 3h

### 5. Prebaci sa localStorage na HTTP-only Cookies
**Prioritet:** 🟡 SREDNJE  
**Trajanje:** 4h

### 6. Dodaj Content-Security-Policy Header
**Prioritet:** 🟢 NISKO  
**Trajanje:** 1h

---

## 📋 DUGOROČNE AKCIJE

### 7. Implementiraj Two-Factor Authentication (2FA)
**Prioritet:** 🟢 NISKO  
**Trajanje:** 2 dana

### 8. Penetration Testing
**Prioritet:** 🟢 NISKO  
**Trajanje:** External service

### 9. Security Training za Developere
**Prioritet:** 🟢 NISKO  
**Trajanje:** Ongoing

---

## 🎯 KAKO POBOLJŠATI SKOR NA 9/10

### Kritični Fixevi (6.5 → 8.0)
1. ✅ Dodaj admin autorizaciju - **+1.0**
2. ✅ Implementiraj rate limiting - **+0.5**

### Dodatna Poboljšanja (8.0 → 9.0)
3. ✅ Audit logging - **+0.3**
4. ✅ HTTP-only cookies - **+0.3**
5. ✅ CSP headers - **+0.2**
6. ✅ Fix npm vulnerabilities - **+0.2**

---

## 📞 SECURITY CONTACTS

**Za sigurnosne incidente:**
- GitHub Issues (private): https://github.com/Vepar23/office-desk-reservation/issues
- Email: [Dodaj kontakt email]

**Responsible Disclosure:**
Ako pronađete security vulnerability, molimo da je prijavite privatno prije public disclosure-a.

---

## 📅 REDOVNO ODRŽAVANJE

### Mjesečno:
- [ ] Provjeri Supabase logs za sumnjive aktivnosti
- [ ] Provjeri Vercel deployment logs
- [ ] Review user access lista
- [ ] `npm audit` za nove vulnerabilities

### Kvartalno:
- [ ] Rotiraj Supabase API keys
- [ ] Promijeni admin lozinku
- [ ] Security audit review
- [ ] Backup testiranje

### Godišnje:
- [ ] Full penetration test
- [ ] Security assessment od external firme
- [ ] Update security documentation

---

## ✅ FINALNI ZAKLJUČAK

**Trenutni Status:** 🟡 SREDNJI NIVO SIGURNOSTI

**Prioriteti:**
1. 🔴 Hitno dodaj admin autorizaciju u API endpoints
2. 🔴 Implementiraj rate limiting na login
3. 🟡 Fix npm vulnerabilities

**Nakon ovih izmjena, aplikacija će imati:**
- Skor: **8.0/10** 🟢
- Status: **DOBAR NIVO SIGURNOSTI**

**Dalji koraci za 9.0+:**
- Audit logging
- HTTP-only cookies
- 2FA (opcionalno)

---

**Zapamti: Sigurnost je ongoing proces, ne one-time task! 🔒**

*Izvještaj generisan automatski - Verifikovano ručno*

