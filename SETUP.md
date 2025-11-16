# 🛠️ Setup Uputstva - Office Desk Reservation

Kompletne instrukcije za postavljanje aplikacije na lokalnoj mašini.

---

## 📋 Preduvjeti

Prije početka, osiguraj da imaš instalirano:

- **Node.js** 18.0.0 ili noviji ([Download](https://nodejs.org/))
- **npm** ili **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Code Editor** (VSCode, Cursor, ili sl.)

---

## 🚀 Korak 1: Kloniranje Projekta

```bash
# Kloniraj repozitorij
git clone https://github.com/your-username/office-desk-reservation.git

# Uđi u folder
cd office-desk-reservation
```

---

## 📦 Korak 2: Instalacija Dependencies

```bash
# Instaliraj sve potrebne pakete
npm install

# Ili sa yarn
yarn install
```

### Glavni Paketi:
- `next` - React framework
- `react` & `react-dom` - UI biblioteka
- `typescript` - Type safety
- `tailwindcss` - Styling
- `@supabase/supabase-js` - Database client
- `bcryptjs` - Password hashing
- `zustand` - State management

---

## 🗄️ Korak 3: Supabase Setup

### 3.1 Kreiranje Projekta

1. Idi na [Supabase Dashboard](https://supabase.com/dashboard)
2. Klikni **"New Project"**
3. Unesi:
   - **Project Name:** office-reservation
   - **Database Password:** [zapamti ovu lozinku]
   - **Region:** Najbliža regija
4. Klikni **"Create new project"**
5. Sačekaj 2-3 minuta da se projekat kreira

### 3.2 Dohvatanje Credentials

1. U Supabase Dashboard, idi na **Settings → API**
2. Kopiraj:
   - **Project URL** (npr. `https://abc123.supabase.co`)
   - **anon/public key** (počinje sa `eyJhbGc...`)
3. U **Service Role** sekciji, klikni "Reveal" i kopiraj:
   - **service_role key** (počinje sa `eyJhbGc...`)

⚠️ **VAŽNO:** Service Role key je **tajna** - nikad ga ne dijeli ili commit-uj u Git!

### 3.3 Kreiranje Tabela

1. U Supabase Dashboard, idi na **SQL Editor**
2. Klikni **"New Query"**
3. Otvori fajl `supabase-complete-setup.sql` iz projekta
4. Kopiraj **SVE** i zalepi u SQL Editor
5. Klikni **"Run"**

Ovo će kreirati:
- ✅ `users` tabela
- ✅ `desk_elements` tabela
- ✅ `reservations` tabela
- ✅ `office_map` tabela
- ✅ Default admin korisnik (username: admin)

### 3.4 Omogućavanje RLS Policies

1. U SQL Editoru, kreiraj **novu query**
2. Otvori fajl `supabase-security-policies.sql`
3. Kopiraj i zalepi
4. Klikni **"Run"**

Ovo će omogućiti Row Level Security i kreirati politike za sve tabele.

### 3.5 Kreiranje Storage Bucket (Opcionalno)

Za upload office mape na Supabase:

1. Idi na **Storage** u Supabase Dashboard
2. Klikni **"New Bucket"**
3. Ime: `office-maps`
4. Omogući **Public bucket** (checkbox)
5. Klikni **"Create bucket"**

---

## 🔐 Korak 4: Environment Variables

### 4.1 Kreiranje .env.local Fajla

U root folderu projekta, kreiraj fajl `.env.local`:

```bash
# Windows (Command Prompt)
type nul > .env.local

# Windows (PowerShell)
New-Item .env.local

# Mac/Linux
touch .env.local
```

### 4.2 Popunjavanje Credentials

Otvori `.env.local` i dodaj:

```bash
# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Zamijeni:**
- `your-project-id` → Tvoj Supabase project ID
- Anon key → Key iz Supabase Dashboard
- Service Role key → Service role key iz Supabase Dashboard

### 4.3 Provjera

Provjer da li je `.env.local` u `.gitignore`:

```bash
# Otvori .gitignore i provjeri da sadrži:
.env.local
```

✅ Ako sadrži `.env.local`, sve je OK!  
❌ Ako ne sadrži, dodaj liniju `.env.local` u `.gitignore`!

---

## 🏃 Korak 5: Pokretanje Aplikacije

### Development Mode

```bash
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:3000**

### Production Build (Lokalno)

```bash
# Build aplikacije
npm run build

# Pokreni production server
npm start
```

---

## 🔑 Korak 6: Admin Pristup

### 6.1 Dohvatanje Admin Credentials

Admin korisnik je kreiran u **Korak 3.3** (`supabase-complete-setup.sql`).

**Default Admin:**
- **Username:** `admin`
- **Password:** `test123` (ako je kreiran preko SQL-a)

⚠️ **KRITIČNO:** Promijeni admin lozinku **ODMAH** nakon prvog logina!

### 6.2 Prvi Login

1. Idi na **http://localhost:3000/login**
2. Unesi:
   - Username: `admin`
   - Password: `test123` (ili lozinka koja je postavljena u SQL-u)
3. Klikni **"Prijavi se"**

### 6.3 Promjena Lozinke

1. Na dashboardu, klikni **"Lozinka"** dugme
2. Unesi:
   - **Trenutna lozinka:** `test123`
   - **Nova lozinka:** [jaka lozinka, min 6 znakova]
3. Klikni **"Promijeni"**

---

## 🗺️ Korak 7: Upload Mape Ureda

Postoje **2 načina** za dodavanje mape:

### Način 1: Lokalni Upload (Development Only)

1. Login kao admin
2. Idi na **Admin** panel
3. U sekciji **Office Map**, klikni **"Choose File"**
4. Odaberi sliku ureda (PNG, JPG, WEBP, GIF, ili PDF)
5. Klikni **"Upload Map"**

⚠️ **Napomena:** Lokalni upload **NE RADI** na Vercel (serverless)!

### Način 2: Supabase Storage (Production)

1. Idi na **Supabase Dashboard → Storage**
2. Otvori `office-maps` bucket
3. Klikni **"Upload file"**
4. Upload sliku ureda
5. Klikni na fajl i kopiraj **Public URL**
6. U Admin panelu, zalepi URL u **"Office Map URL"** polje
7. Klikni **"Set URL"**

---

## 🛠️ Korak 8: Dodavanje Radnih Mjesta

1. U Admin panelu, klikni **"Dodaj Sto"**
2. **Drag & Drop** sto na željenu poziciju na mapi
3. **Resize** - Povuci uglove za promjenu veličine
4. **Keyboard Kontrole:**
   - Arrow keys - Pomjeranje (1px)
   - Shift + Arrow - Brže pomjeranje (10px)
   - Ctrl/Cmd + Arrow - Resize
5. Izmjene se **automatski spremaju**

---

## ✅ Korak 9: Kreiranje Korisnika

1. U Admin panelu, idi na **"Korisnici"** sekciju
2. Klikni **"Dodaj Korisnika"**
3. Unesi:
   - **Username:** Min 3 znaka (dozvoljeni: slova, brojevi, razmaci, š ž č ć đ)
   - **Password:** Min 6 znakova
   - **Admin:** Checkbox (opcionalno)
4. Klikni **"Kreiraj"**

Novi korisnici mogu odmah da se loguju sa svojim credentialima!

---

## 🧪 Korak 10: Testiranje

### Test 1: Rezervacija Mjesta

1. Logout iz admin naloga
2. Login sa normalnim korisničkim nalogom
3. Na dashboardu:
   - Odaberi datum u kalendaru
   - Klikni na zeleno (slobodno) mjesto
   - Potvrdi rezervaciju
4. Provjeri da li se mjesto prikazuje kao crveno (rezervirano)

### Test 2: Lista Rezervacija

1. Na dashboardu, skroluj do **"Sve Rezervacije"**
2. Provjeri da li vidiš rezervaciju sa:
   - Brojem mjesta
   - Datumom
   - Imenom korisnika
3. Klikni **"Otkaži"** da obrišeš rezervaciju

### Test 3: Admin Funkcionalnost

1. Login kao admin
2. Idi na Admin panel
3. Kreiraj novog korisnika
4. Logout i login sa novim korisnikom
5. Napravi rezervaciju
6. Logout i login kao admin ponovo
7. Provjeri da li vidiš rezervaciju novog korisnika

---

## 🐛 Troubleshooting

### Problem 1: "Failed to fetch" greška

**Uzrok:** Supabase credentials nisu postavljeni ili su neispravni.

**Rješenje:**
1. Provjeri `.env.local` fajl
2. Provjeri da su kredencijali tačni
3. Restartuj development server (`npm run dev`)

---

### Problem 2: "Relation does not exist" greška

**Uzrok:** Tabele nisu kreirane u Supabase.

**Rješenje:**
1. Otvori Supabase SQL Editor
2. Pokreni `supabase-complete-setup.sql`
3. Provjeri da su sve tabele kreirane (SQL Editor → Tables)

---

### Problem 3: Ne mogu se ulogirati

**Uzrok:** Admin korisnik nije kreiran ili lozinka nije tačna.

**Rješenje:**
1. Otvori Supabase SQL Editor
2. Pokreni query:
```sql
SELECT * FROM users WHERE username = 'admin';
```
3. Ako ne postoji, pokreni ponovo `supabase-complete-setup.sql`

---

### Problem 4: Mapa se ne prikazuje

**Uzrok:** Slika nije uploadovana ili path je neispravan.

**Rješenje:**
1. Koristi Supabase Storage umjesto lokalnog uploada
2. Kopiraj public URL iz Supabase Storage
3. Zalepi URL u Admin panelu

---

### Problem 5: Port 3000 je zauzet

**Rješenje:**
```bash
# Koristi drugi port
npm run dev -- -p 3001
```

---

## 📁 Folder Struktura

```
office-desk-reservation/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication
│   │   ├── desks/                # Desk management
│   │   ├── reservations/         # Reservation management
│   │   └── users/                # User management
│   ├── admin/                    # Admin panel
│   ├── dashboard/                # User dashboard
│   └── login/                    # Login page
├── components/                   # React components
│   ├── Calendar.tsx
│   ├── OfficeMap.tsx
│   └── ...
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication utils
│   └── supabase/                 # Supabase clients
├── store/                        # Zustand stores
├── public/                       # Static files
├── .env.local                    # Environment variables (ne commit-uj!)
├── supabase-complete-setup.sql   # Database setup
├── supabase-security-policies.sql # RLS policies
└── package.json                  # Dependencies
```

---

## 🔄 Update Aplikacije

Kada povučeš nove izmjene sa Git-a:

```bash
# Pull latest changes
git pull origin main

# Install any new dependencies
npm install

# Restart dev server
npm run dev
```

---

## 🎯 Sljedeći Koraci

Nakon što aplikacija radi lokalno:

1. 📖 Pročitaj [`DEPLOYMENT.md`](./DEPLOYMENT.md) za production deployment
2. 🔒 Pročitaj [`SECURITY.md`](./SECURITY.md) za security best practices
3. 🚀 Deploy na Vercel
4. 🔑 Rotiraj Supabase ključeve ako su bili exposed

---

## 📞 Support

Ako imaš problema:
1. Provjeri **Troubleshooting** sekciju
2. Provjeri Supabase logs (Dashboard → Logs)
3. Provjeri browser console za greške (F12)
4. Kontaktiraj administratora projekta

---

**Happy Coding! 🚀**

