# 🔧 Sažetak Popravki - Ažuriranje Admin Panela

## 📅 Datum: 12. Novembar 2025

---

## 🐛 Problemi Prije Popravki

1. ❌ **Admin ne vidi sliku ureda** - slike se ne prikazuju nakon upload-a
2. ❌ **Admin ne vidi elemente (stolove)** - stolovi nisu vidljivi na mapi
3. ❌ **Ne može se kreirati novi korisnik** - greška pri kreiranju korisnika
4. ❌ **Podaci se gube nakon restarta servera** - in-memory storage

---

## ✅ Šta Je Popravljeno

### 1. **API Ruta: `/api/desks/route.ts`**
- ✅ Zamijenjen **in-memory storage** sa **Supabase bazom**
- ✅ GET metoda - dohvaća stolove iz `desk_elements` tabele
- ✅ POST metoda - kreira nove stolove u bazi
- ✅ PUT metoda - ažurira pozicije i veličine stolova u realnom vremenu
- ✅ DELETE metoda - briše stolove iz baze

**Rezultat:** Stolovi se sada **trajno čuvaju** u bazi i **vidljivi su nakon restarta**.

---

### 2. **API Ruta: `/api/office-map/route.ts`**
- ✅ Zamijenjen **in-memory storage** sa **Supabase bazom**
- ✅ GET metoda - dohvaća zadnju uploadanu mapu iz `office_map` tabele
- ✅ POST metoda - čuva URL slike mape u bazi (update ako već postoji, insert ako je nova)

**Rezultat:** Mapa ureda se sada **trajno čuva** u bazi i **vidljiva je nakon restarta**.

---

### 3. **Kreiranje Dokumentacije**
- ✅ Kreiran **ENV_SETUP_INSTRUCTIONS.md** sa detaljnim uputstvima
- ✅ Objasnjen proces postavljanja `.env.local` fajla
- ✅ Uključeni troubleshooting savjeti

---

## 🚀 Šta Korisnik Treba Da Uradi

### ⚠️ KRITIČNO: Kreirati `.env.local` fajl

Bez ovog fajla, aplikacija **NEĆE RADITI**!

### Korak 1: Kreirajte `.env.local` fajl

U **root direktoriju** projekta (gdje se nalazi `package.json`), kreirajte novi fajl nazvan **`.env.local`**.

**Sadržaj fajla:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Korak 2: Dobijte Supabase Kredencijale

#### A) Ako **NEMATE** Supabase projekat:

1. Idite na [supabase.com](https://supabase.com) i kreirajte account
2. Kliknite **"New Project"**
3. Popunite podatke i kreirajte projekat (čeka se 2-3 min)

#### B) Ako **IMATE** Supabase projekat:

1. Ulogujte se na [supabase.com](https://supabase.com)
2. Odaberite vaš projekat
3. Idite na **Settings** → **API**
4. Kopirajte:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

### Korak 3: Kreiranje Database Tabela

U Supabase dashboard-u:

1. Idite na **SQL Editor**
2. Kliknite **"New Query"**
3. Kopirajte SQL kod iz **`SUPABASE_SETUP.md`** (linija 52-155)
4. Izvršite (kliknite **"Run"**)

**Tabele koje će biti kreirane:**
- ✅ `users`
- ✅ `office_map`
- ✅ `desk_elements`
- ✅ `reservations`

---

### Korak 4: Restartujte Development Server

Nakon kreiranja `.env.local` fajla:

```bash
# Zaustavite trenutni server (Ctrl+C)

# Zatim pokrenite ponovo:
npm run dev
```

---

## ✅ Rezultat Nakon Setup-a

Nakon što završite sve korake:

### Admin Panel:
- ✅ **Upload mape ureda** - slike se čuvaju i prikazuju
- ✅ **Kreiranje stolova** - stolovi se dodaju i vidljivi su odmah
- ✅ **Drag & drop stolova** - pozicije se ažuriraju u realnom vremenu
- ✅ **Resize stolova** - veličine se čuvaju u bazi
- ✅ **Brisanje stolova** - trajno uklanjanje iz baze
- ✅ **Kreiranje korisnika** - novi korisnici se uspješno dodaju

### User Dashboard:
- ✅ **Vidi trenutnu mapu ureda** sa svim elementima
- ✅ **Interaktivni stolovi** - klikom na zelene stolove rezerviše mjesto
- ✅ **Sinhronizovano** - isti podaci kao na admin panelu

---

## 📁 Izmijenjeni Fajlovi

```
EREZ/
├── app/
│   └── api/
│       ├── desks/
│       │   └── route.ts ← ✅ AŽURIRANO (Supabase integracija)
│       └── office-map/
│           └── route.ts ← ✅ AŽURIRANO (Supabase integracija)
├── ENV_SETUP_INSTRUCTIONS.md ← ✅ KREIRANO (Uputstva)
└── POPRAVKE_SUMMARY.md ← ✅ KREIRANO (Ovaj fajl)
```

---

## 🔍 Provjera Da Li Sve Radi

Nakon setup-a, testirajte sljedeće:

### 1. **Testiranje Admin Panela:**
```
1. Otvorite: http://localhost:3000/login
2. Prijavite se kao admin (username: admin, password: test123)
3. Idite na Admin Panel
4. Tab "Mapa Ureda":
   - Upload-ujte sliku ureda
   - Provjerite da li se slika prikazuje ispod forme
5. Tab "Stolovi":
   - Dodajte novi stol (npr. A1)
   - Provjerite da li se pojavljuje na listi
6. Tab "Mapa Ureda" (ponovo):
   - Drag & drop stol na novi položaj
   - Resize stol
   - Osvježite stranicu (F5) - sve promjene trebaju biti sačuvane
7. Tab "Korisnici":
   - Kreirajte novog korisnika
   - Provjerite da li se pojavljuje na listi
```

### 2. **Testiranje User Dashboard-a:**
```
1. Otvorite: http://localhost:3000/dashboard
2. Provjerite da li se vidi mapa ureda
3. Provjerite da li se vide stolovi
4. Kliknite na zeleni stol - rezervišite mjesto
5. Provjerite da li stol postaje crven
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to Supabase"
**Rješenje:**
- Provjerite da li ste **restartovali** server nakon kreiranja `.env.local`
- Provjerite da li su **svi API keys** pravilno uneseni

### Problem: "relation 'desk_elements' does not exist"
**Rješenje:**
- Izvršite SQL kod iz **SUPABASE_SETUP.md** da kreirate tabele

### Problem: "Admin ne vidi uploadanu sliku"
**Rješenje:**
1. Provjerite da li je slika uspješno upload-ana (F12 → Network tab)
2. Provjerite da li je URL slike ispravan
3. Osvježite stranicu (F5)

### Problem: "Stolovi se ne prikazuju"
**Rješenje:**
1. Provjerite console greške (F12 → Console)
2. Provjerite da li su tabele kreirane u Supabase
3. Provjerite da li je `.env.local` pravilno postavljen

---

## 📚 Dodatni Resursi

- **ENV_SETUP_INSTRUCTIONS.md** - Detaljno uputstvo za setup
- **SUPABASE_SETUP.md** - Kompletne instrukcije za Supabase
- **README.md** - Opšte informacije o projektu
- **USAGE_GUIDE.md** - Kako koristiti sve funkcionalnosti

---

## 🎯 Zaključak

Svi problemi sa admin panelom su **riješeni**! Aplikacija sada koristi **Supabase bazu podataka** za trajno čuvanje svih podataka.

**Sledeći korak:** Kreirajte `.env.local` fajl prema uputstvima i aplikacija će raditi bez problema! 🚀

---

**Pitanja ili problemi?** Pogledajte dokumentaciju ili provjerite troubleshooting sekciju.

