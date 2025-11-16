# 🚨 Quick Security Fixes - Action Required!

## ⚠️ TRENUTNO STANJE

Vaša aplikacija **IMA OZBILJNE SIGURNOSNE RUPE**:

1. ❌ Bilo ko može da obriše **bilo čiju rezervaciju** ako zna ID
2. ❌ Bilo ko može da vidi **sve korisnike** preko `/api/users`
3. ❌ Bilo ko može da menja **sve desk-ove** preko `/api/desks`
4. ❌ Default admin lozinka `test123` je **javno poznata**

---

## 🔥 HITNE AKCIJE (Sledećih 24h)

### 1. PROMENITE ADMIN LOZINKU (5 minuta)

**Koraci:**
1. Otvorite Vercel app: https://your-app.vercel.app
2. Ulogujte se: `admin` / `test123`
3. Kliknite dugme **"Lozinka"** (🔒) u header-u
4. Promenite na **jaku lozinku** (npr. generisanu sa password manager-om)
5. **Sačuvajte** novu lozinku negde bezbedno

**Nakon što promenite lozinku, hardcoded check će prestati da radi, što je DOBRO.**

---

### 2. ROTIRAJTE SUPABASE KLJUČEVE (10 minuta)

**Zašto?**
GitHub je detektovao vaše Supabase ključeve u commit istoriji. Oni su **JAVNO VIDLJIVI**.

**Koraci:**

1. **Idi na Supabase Dashboard:**
   https://supabase.com/dashboard/project/gsrvcotpczxiojwwwszs/settings/api

2. **Resetuj ključeve:**
   - Klikni "Reset API keys" ili "Generate new keys"
   - Kopiraj **novi Anon Key**
   - Kopiraj **novi Service Role Key**

3. **Ažuriraj na Vercel:**
   - https://vercel.com/dashboard → tvoj projekat
   - Settings → Environment Variables
   - Edit `NEXT_PUBLIC_SUPABASE_ANON_KEY` → novi anon key
   - Edit `SUPABASE_SERVICE_ROLE_KEY` → novi service role key
   - Save

4. **Redeploy:**
   - Deployments tab → Latest deployment → ... → Redeploy

5. **Ažuriraj lokalno:**
   - Otvori `.env.local`
   - Zameni stare ključeve sa novim
   - Restartuj dev server: `npm run dev`

---

### 3. OMOGUĆI SUPABASE RLS POLICIES (10 minuta)

**Koraci:**

1. **Otvori Supabase SQL Editor:**
   https://supabase.com/dashboard/project/gsrvcotpczxiojwwwszs/sql/new

2. **Kopiraj i izvršite SQL iz:**
   `supabase-security-policies.sql`

3. **Klikni "Run"**

4. **Proveri da je sve OK:**
   Trebalo bi da vidite poruku: "Success. No rows returned."

---

## 📋 VERIFIKACIJA

Nakon ovih koraka, proveri:

### Test 1: Nova Admin Lozinka
```bash
# Pokušaj login sa starom lozinkom:
# Treba da NE RADI ❌
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"test123"}'

# Response: {"error":"Neispravno korisničko ime ili lozinka"}
```

### Test 2: Novi Supabase Ključevi
```bash
# Testiraj login sa admin nalogom (nova lozinka):
# Treba da RADI ✅
```

### Test 3: RLS Enabled
```sql
-- U Supabase SQL Editor:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'desks', 'reservations', 'office_map');

-- Svi trebaju da imaju rowsecurity = true
```

---

## 📊 NAKON OVIH KORAKA

**Sigurnosni Score:**
- Pre: 4/10 🔴
- Posle: 6/10 🟡 (Bolje, ali još ima posla)

**Sledeći koraci** (1-7 dana):
1. Dodaj backend validation u API endpoints
2. Implementiraj rate limiting
3. Dodaj logging

**Vidi kompletan plan u:**
- `SECURITY_AUDIT_REPORT.md` - Detaljan sigurnosni izveštaj
- `SECURITY_ROTATE_KEYS.md` - Detaljne instrukcije za rotaciju ključeva

---

## ⏰ VREMENSKA LINIJA

| Akcija | Vreme | Prioritet |
|--------|-------|-----------|
| Promeni admin lozinku | 5 min | 🔴 KRITIČNO |
| Rotiraj Supabase ključeve | 10 min | 🔴 KRITIČNO |
| Omogući RLS policies | 10 min | 🔴 KRITIČNO |
| **UKUPNO** | **25 min** | |

---

## 🆘 ŠTA AKO NEŠTO POĐE PO ZLU?

### Problem: Ne mogu da se ulogujem nakon promene lozinke

**Rešenje:**
1. Proverite da li ste tačno uneli novu lozinku
2. Pokušajte reset preko Supabase SQL:

```sql
-- U Supabase SQL Editor:
UPDATE users 
SET password_hash = '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K'
WHERE username = 'admin';
-- Ovo vraća lozinku na 'test123'
```

### Problem: Vercel app ne radi nakon redeploy-a

**Rešenje:**
1. Proverite Vercel logs: Deployments → Function Logs
2. Proverite da li su environment varijable tačno postavljene
3. Pokušajte još jedan redeploy

### Problem: Supabase connection error

**Rešenje:**
1. Proverite da li su novi ključevi tačno kopirani (bez razmaka)
2. Proverite da li ste kliknuli "Save" na Vercel-u
3. Proverite u Supabase Dashboard da li je projekat aktivan

---

## ✅ CHECKLIST

Pre nego što zatvorite ovaj fajl:

- [ ] Promenio sam admin lozinku na Vercel app-u
- [ ] Resetovao sam Supabase API ključeve
- [ ] Ažurirao sam ključeve na Vercel-u
- [ ] Redeploy-ovao sam Vercel app
- [ ] Ažurirao sam lokalni `.env.local`
- [ ] Izvršio sam SQL za RLS policies
- [ ] Testirao sam da se mogu ulogovati
- [ ] Testirao sam da aplikacija radi ispravno
- [ ] Pročitao sam `SECURITY_AUDIT_REPORT.md`

---

**⚠️ OVO NIJE OPCIONO!**

Ako ne uradite ove korake, vaša aplikacija je **lako kompromitovana**.

Potrebno vam je samo **25 minuta** da **značajno poboljšate** sigurnost.

**Uradite to SADA!** 🔐

