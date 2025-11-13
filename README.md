# 🏢 Aplikacija za Rezervaciju Mjesta u Uredu

Moderna, full-stack aplikacija za upravljanje rezervacijama radnih mjesta u uredu, izgrađena sa Next.js 14, TypeScript i Tailwind CSS.

## ✨ Glavne Funkcionalnosti

### 👤 Korisničke Funkcionalnosti
- 🔐 Sigurna prijava sa username/password autentifikacijom
- 📅 Interaktivni kalendar sa plavom pozadinom
- 🚫 Automatsko onemogućavanje vikenda (zasivljeno)
- 🗺️ Vizualna mapa ureda sa interaktivnim elementima
- 🎨 Color-coded mjesta:
  - 🟢 **Zeleno**: Slobodno mjesto
  - 🔴 **Crveno**: Rezervirano mjesto
  - ⚫ **Sivo**: Trajno zauzeto mjesto
- 📋 Lista svih rezervacija korisnika po danima
- ⚠️ Zaštita: Jedno mjesto po korisniku po danu
- 📱 **Mobilna Podrška:**
  - Responsive design za sve veličine ekrana
  - Hamburger menu za listu rezervacija
  - Touch-optimized interface
  - Adaptive layout (Kalendar → Mapa → Hamburger Menu)

### 👨‍💼 Admin Funkcionalnosti
- 👥 Kreiranje i upravljanje korisnicima
- 🗺️ Upload mape ureda kao pozadinske slike (lokalni fajl ili URL)
- 📁 Podržani formati: JPG, PNG, WEBP, GIF, PDF (maks. 5MB)
- ➕ Dodavanje interaktivnih elemenata (stolova) na mapu
- ✏️ Uređivanje stolova (drag & drop, resize)
- ⌨️ Keyboard kontrole za precizno uređivanje
- 🗑️ Brisanje stolova
- 🔒 Postavljanje trajno zauzetih mjesta
- 💻 Desktop-optimized admin panel

## 🚀 Brzi Start

### Preduvjeti
- Node.js 18+ 
- npm ili yarn
- Supabase account (za production)

### Instalacija

1. **Klonirajte repozitorij**
```bash
git clone <your-repo-url>
cd EREZ
```

2. **Instalirajte zavisnosti**
```bash
npm install
# ili
yarn install
```

3. **Postavite environment varijable**

Kreirajte `.env.local` fajl u root direktoriju:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Pokrenite development server**
```bash
npm run dev
# ili
yarn dev
```

Aplikacija će biti dostupna na `http://localhost:3000`

## 🗄️ Database Setup (Supabase)

### Kreiranje Tabela

Izvršite sljedeće SQL komande u Supabase SQL editoru:

```sql
-- Kreiranje users tabele
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kreiranje office_map tabele
CREATE TABLE office_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kreiranje desk_elements tabele
CREATE TABLE desk_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER DEFAULT 80,
  height INTEGER DEFAULT 80,
  desk_number TEXT NOT NULL,
  status TEXT CHECK (status IN ('available', 'reserved', 'permanently_occupied')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kreiranje reservations tabele
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  desk_id UUID REFERENCES desk_elements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date),
  UNIQUE(desk_id, date)
);

-- Kreiranje indexa za bolje performanse
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_desk_id ON reservations(desk_id);
CREATE INDEX idx_reservations_date ON reservations(date);

-- Kreiranje default admin korisnika (password: test123)
INSERT INTO users (username, password_hash, is_admin)
VALUES ('admin', '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K', true);
```

### Row Level Security (RLS)

Za dodatnu sigurnost, omogućite RLS politike:

```sql
-- Omogući RLS na svim tabelama
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE desk_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Politike za čitanje (omogući svima)
CREATE POLICY "Allow public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON office_map FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON desk_elements FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON reservations FOR SELECT USING (true);

-- Politike za pisanje (samo autentifikovani korisnici)
CREATE POLICY "Allow authenticated insert" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated delete" ON reservations FOR DELETE USING (true);
CREATE POLICY "Allow authenticated insert" ON desk_elements FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON desk_elements FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON desk_elements FOR DELETE USING (true);
```

## 🔐 Default Admin Pristup

**Username:** `admin`  
**Password:** `test123`

⚠️ **VAŽNO:** Promijenite default admin lozinku nakon prve prijave u production okruženju!

## 📦 Deployment na Vercel

### 1. Pripremite GitHub Repozitorij

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Povežite sa Vercel

1. Idite na [vercel.com](https://vercel.com)
2. Kliknite **"New Project"**
3. Importujte vaš GitHub repozitorij
4. Konfigurišite environment varijable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (postavite na vašu Vercel URL)

5. Kliknite **"Deploy"**

### 3. Post-Deployment

Nakon uspješnog deploymenta:
- ✅ Testirajte login funkcionalnost
- ✅ Kreirajte test korisnike
- ✅ Uploadujte mapu ureda
- ✅ Dodajte stolove
- ✅ Testirajte rezervacije

## 🛠️ Tehnologije

- **Frontend Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Custom JWT-based
- **Deployment:** Vercel
- **Version Control:** Git/GitHub

## 📁 Struktura Projekta

```
EREZ/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Autentifikacija
│   │   ├── users/        # User management
│   │   ├── desks/        # Desk management
│   │   ├── reservations/ # Reservation management
│   │   └── office-map/   # Office map upload
│   ├── admin/            # Admin panel
│   ├── dashboard/        # User dashboard
│   ├── login/            # Login page
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # React komponente
│   ├── Calendar.tsx      # Kalendar komponenta
│   └── OfficeMap.tsx     # Mapa ureda komponenta
├── lib/                  # Utility funkcije
│   ├── auth.ts           # Auth helpers
│   ├── utils.ts          # Opšte utility funkcije
│   └── supabase/         # Supabase konfiguracija
├── store/                # Zustand stores
│   ├── useAuthStore.ts   # Auth state
│   └── useReservationStore.ts # Reservation state
└── README.md             # Ova datoteka
```

## 🔒 Sigurnosne Funkcionalnosti

- ✅ Password hashing sa bcryptjs
- ✅ Input validation (username, password)
- ✅ SQL injection zaštita (parametrizovani upiti)
- ✅ XSS zaštita (React default escape)
- ✅ CSRF zaštita
- ✅ Rate limiting (via Vercel)
- ✅ Environment varijable za osetljive podatke
- ✅ Role-based access control (Admin/User)

## 📚 Dokumentacija

Za detaljnije informacije, pogledajte sljedeće vodiče:

- [**QUICK_START.md**](QUICK_START.md) - Brzi vodič za pokretanje u 5 minuta
- [**SUPABASE_SETUP.md**](SUPABASE_SETUP.md) - Kompletan database setup
- [**USAGE_GUIDE.md**](USAGE_GUIDE.md) - Kako koristiti sve funkcionalnosti
- [**FILE_UPLOAD_GUIDE.md**](FILE_UPLOAD_GUIDE.md) - Upload mapa ureda (URL ili lokalni fajl)
- [**KEYBOARD_CONTROLS.md**](KEYBOARD_CONTROLS.md) - Keyboard shortcuts za admin panel
- [**MOBILE_SUPPORT.md**](MOBILE_SUPPORT.md) 📱 - Mobilna/tablet optimizacija
- [**RESPONSIVE_GUIDE.md**](RESPONSIVE_GUIDE.md) - Tehnička dokumentacija responzivnosti
- [**README_STORAGE.md**](README_STORAGE.md) 💾 - Storage configuration (Supabase vs In-Memory)
- [**SWITCHING_STORAGE.md**](SWITCHING_STORAGE.md) - Prebacivanje između storage modova
- [**CHANGELOG.md**](CHANGELOG.md) - Historija verzija i izmjena

## 💾 Storage Configuration

Aplikacija podržava **2 storage moda**:

### 🌐 Supabase Mode (Default)
- **File:** `app/api/users/route.ts`
- **Use Case:** Production, Testing sa bazom
- **Persistence:** ✅ Trajno
- **Setup:** Zahtijeva `.env.local` sa Supabase credentials

### 🧪 In-Memory Mode (Local Dev)
- **File:** `app/api/users/route.local.ts`
- **Use Case:** Brzi development bez baze
- **Persistence:** ❌ Reset nakon restarta
- **Setup:** Nema zahtjeva

### Prebacivanje Između Modova

```powershell
# Switch na in-memory (lokalno testiranje)
.\switch-storage.ps1 -mode local

# Switch nazad na Supabase (production)
.\switch-storage.ps1 -mode supabase
```

**Detalje:** Pogledaj [README_STORAGE.md](README_STORAGE.md) za kompletan vodič

## 🐛 Troubleshooting

### Problem: Prijavljivanje ne radi
**Rješenje:** Provjerite da li su environment varijable pravilno postavljene.

### Problem: Slike se ne prikazuju
**Rješenje:** Provjerite da li je URL slike javno dostupan i da CORS omogućava pristup.

### Problem: Rezervacije ne čuvaju
**Rješenje:** Provjerite database konekciju i da li su tabele pravilno kreirane.

## 📞 Podrška

Za pitanja ili probleme:
1. Provjerite **Troubleshooting** sekciju
2. Pogledajte GitHub Issues
3. Kontaktirajte development tim

## 📄 Licenca

MIT License - slobodno koristite za komercijalne i ne-komercijalne svrhe.

---

**Napravljeno sa ❤️ za lakše upravljanje radnim prostorima**

