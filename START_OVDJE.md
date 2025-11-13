# 🚀 POČNITE OVDJE - Konfiguracija Aplikacije

---

## ⚠️ HITNO: Prije pokretanja aplikacije!

Aplikacija **trenutno NE RADI** jer nedostaje konfiguracija za Supabase bazu podataka.

---

## 📝 ŠTA JE PROBLEM?

**Vi ste primijetili:**
- ❌ Admin ne vidi sliku ureda nakon upload-a
- ❌ Admin ne vidi stolove (elemente) na mapi
- ❌ Ne može se kreirati novi korisnik

**Razlog:**
API rute su sada povezane sa **Supabase bazom podataka**, ali nedostaje **`.env.local`** fajl sa kredencijalima.

---

## ✅ ŠTA JE POPRAVLJENO?

Sve API rute su **ažurirane** i sada koriste Supabase:
- ✅ `/api/desks/route.ts` - trajno čuva stolove
- ✅ `/api/office-map/route.ts` - trajno čuva mapu ureda
- ✅ `/api/users/route.ts` - već je koristio Supabase

**Rezultat:** Svi podaci se sada **trajno čuvaju u bazi** umjesto u memoriji.

---

## 🎯 ŠTA TREBATE URADITI?

### 📌 KORAK 1: Kreirajte `.env.local` fajl

U **root direktoriju** projekta, kreirajte fajl nazvan **`.env.local`** sa sledećim sadržajem:

```env
NEXT_PUBLIC_SUPABASE_URL=vaš_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Gdje naći kredencijale?**

#### Ako imate Supabase projekat:
1. Idite na [supabase.com](https://supabase.com)
2. Odaberite projekat
3. **Settings** → **API**
4. Kopirajte vrednosti

#### Ako NEMATE Supabase projekat:
1. Idite na [supabase.com](https://supabase.com)
2. Registrujte se i kreirajte **novi projekat**
3. Sačekajte 2-3 minuta dok se projekat kreira
4. Idite na **Settings** → **API** i kopirajte kredencijale

---

### 📌 KORAK 2: Kreirajte Tabele u Supabase

U Supabase dashboard-u:

1. **SQL Editor** → **New Query**
2. Kopirajte SQL kod iz fajla **`SUPABASE_SETUP.md`** (linija 52-155)
3. Kliknite **"Run"**

**Tabele koje će biti kreirane:**
- users
- office_map
- desk_elements
- reservations

---

### 📌 KORAK 3: Restartujte Server

```bash
# Zaustavite trenutni server (Ctrl+C)
npm run dev
```

---

## ✅ PROVJERA

Nakon što završite sve korake, aplikacija će raditi:

### Admin Panel:
- ✅ Upload mape ureda - slika se prikazuje
- ✅ Dodavanje stolova - vidljivi na mapi
- ✅ Drag & drop - pozicije se čuvaju
- ✅ Kreiranje korisnika - uspješno

### User Dashboard:
- ✅ Vidi mapu ureda
- ✅ Vidi sve stolove
- ✅ Može rezervisati mjesto

---

## 📚 DETALJNA DOKUMENTACIJA

Ako vam trebaju detaljne instrukcije, pogledajte:

### Za Setup:
1. **BRZI_VODIC_ZA_POKRETANJE.md** ⚡ - 3 koraka za pokretanje
2. **ENV_SETUP_INSTRUCTIONS.md** 🔐 - Detaljno o `.env.local` fajlu
3. **SUPABASE_SETUP.md** 🗄️ - Kreiranje i konfiguracija Supabase projekta

### Za Informacije:
4. **POPRAVKE_SUMMARY.md** 🔧 - Šta je sve popravljeno
5. **README.md** 📖 - Opšte informacije o projektu

---

## 🆘 PROBLEMI?

### "Cannot connect to Supabase"
➡️ Restartujte server nakon kreiranja `.env.local`

### "relation does not exist"
➡️ Izvršite SQL kod iz Koraka 2

### Slike se ne prikazuju
➡️ Provjerite da li `public/uploads/` folder postoji

---

## 💡 TL;DR (Kratak Sažetak)

```bash
# 1. Kreirajte .env.local fajl sa Supabase kredencijalima
# 2. Izvršite SQL kod u Supabase SQL Editor-u
# 3. Restartujte server: npm run dev
# 4. Testirajte: http://localhost:3000/login (admin/test123)
```

---

**Kada završite setup, aplikacija će raditi savršeno! 🎉**

Svi problemi koje ste primijetili su **riješeni** i aplikacija sada koristi **Supabase bazu** za sve podatke.

