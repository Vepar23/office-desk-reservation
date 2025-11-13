# 🔐 Environment Setup - Uputstvo za Postavljanje .env.local

## ⚠️ VAŽNO: Morate kreirati `.env.local` fajl prije pokretanja aplikacije!

Aplikacija zahtijeva Supabase kredencijale za rad. Bez ovih podataka, **neće biti moguće**:
- ✅ Kreirati nove korisnike
- ✅ Uploadati mapu ureda
- ✅ Dodavati i ažurirati stolove
- ✅ Pregledati podatke kao admin

---

## 📝 Korak 1: Kreiranje `.env.local` fajla

U **root direktoriju projekta** (gdje se nalazi `package.json`), kreirajte novi fajl sa nazivom **`.env.local`**.

---

## 📋 Korak 2: Dodavanje Varijabli

Kopirajte sljedeći sadržaj u vaš `.env.local` fajl:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔑 Korak 3: Pronalaženje Supabase Kredencijala

### A) Ako **NEMATE** Supabase projekat

1. Idite na [supabase.com](https://supabase.com)
2. Kliknite **"Start your project"** i kreirajte account
3. Kliknite **"New Project"**
4. Popunite podatke:
   - **Name:** `office-booking` (ili željeno ime)
   - **Database Password:** Generirajte jaku lozinku i sačuvajte je
   - **Region:** Izaberite najbližu regiju (npr. Frankfurt)
   - **Plan:** Free tier
5. Kliknite **"Create new project"** i sačekajte 2-3 minuta

### B) Ako **IMATE** Supabase projekat

1. Ulogujte se na [supabase.com](https://supabase.com)
2. Odaberite vaš projekat
3. Idite na **Settings** → **API**

---

## 📌 Korak 4: Kopirajte API Keys

U **Settings → API** sekciji, pronaći ćete:

### 1️⃣ Project URL
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
```
➡️ Kopirajte **Project URL** i zamijenite `your_supabase_project_url_here`

### 2️⃣ Anon/Public Key
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
➡️ Kopirajte **anon public** key i zamijenite `your_supabase_anon_key_here`

### 3️⃣ Service Role Key
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
➡️ Kopirajte **service_role** key i zamijenite `your_supabase_service_role_key_here`

⚠️ **UPOZORENJE:** `service_role` key je **tajna** - nikad ga ne dijelite niti commitujte u Git!

---

## 🗄️ Korak 5: Kreiranje Database Schema

Nakon što ste postavili `.env.local`, potrebno je kreirati tabele u Supabase bazi:

1. U Supabase dashboard-u, idite na **SQL Editor**
2. Kliknite **"New Query"**
3. Kopirajte i izvršite SQL kod iz fajla **`SUPABASE_SETUP.md`** (linija 52-155)
4. Kliknite **"Run"** da kreirate tabele

Tabele koje će biti kreirane:
- ✅ `users` - Korisnici sistema
- ✅ `office_map` - Mapa ureda
- ✅ `desk_elements` - Stolovi/elementi na mapi
- ✅ `reservations` - Rezervacije

---

## ✅ Korak 6: Provjera Setup-a

Nakon što ste postavili sve, provjerite:

### 1. Provjerite da li `.env.local` postoji:
```powershell
# U root direktoriju projekta
dir .env.local
```

### 2. Provjerite sadržaj (bez prikazivanja keys):
```powershell
Get-Content .env.local
```

### 3. Restartujte development server:
```bash
# Zaustavite server (Ctrl+C)
# Zatim pokrenite ponovo:
npm run dev
```

---

## 📁 Primjer Pravilno Postavljenog `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5MDAwMDAwMCwiZXhwIjoyMDA1NTc2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjIwMDU1NzYwMDB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module '@supabase/supabase-js'"
**Rješenje:**
```bash
npm install
```

### Problem: "Invalid API key" ili "Supabase URL is undefined"
**Rješenje:**
- Provjerite da li ste **restartovali** development server nakon kreiranja `.env.local`
- Provjerite da li su **svi keys** pravilno kopirani (bez dodatnih razmaka)
- Provjerite da li `.env.local` fajl postoji u **root direktoriju**

### Problem: "relation 'users' does not exist"
**Rješenje:**
- Izvršite SQL kod iz **SUPABASE_SETUP.md** da kreirate tabele

### Problem: "Nisam mogao kreirati novog korisnika"
**Rješenje:**
1. Provjerite da li su tabele kreirane u Supabase
2. Provjerite konzolu u browser-u (F12) za greške
3. Provjerite server konzolu za greške povezivanja

---

## 🔒 Sigurnosne Napomene

1. ❌ **NIKAD** ne commitujte `.env.local` fajl u Git
2. ✅ `.env.local` je već dodat u `.gitignore`
3. ✅ Koristite različite Supabase projekte za development i production
4. ✅ `service_role` key ima **pune privilegije** - čuvajte ga kao tajnu

---

## 📞 Dodatna Pomoć

Ako imate problema sa setup-om:
1. Provjerite **SUPABASE_SETUP.md** za detaljne instrukcije
2. Provjerite **README.md** za opšte informacije o projektu
3. Provjerite Supabase dokumentaciju: [supabase.com/docs](https://supabase.com/docs)

---

**Sretno! 🚀 Nakon postavljanja `.env.local` fajla, aplikacija bi trebala raditi bez problema.**

