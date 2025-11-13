# 🗄️ Supabase Setup Guide

Ovaj dokument sadrži detaljne instrukcije za postavljanje Supabase baze podataka za aplikaciju.

## 📋 Pregled

Aplikacija koristi Supabase kao cloud database provider. Supabase je open-source alternative Firebase-u, zasnovan na PostgreSQL-u.

## 🚀 Kreiranje Supabase Projekta

### Korak 1: Registracija

1. Idite na [supabase.com](https://supabase.com)
2. Kliknite **"Start your project"**
3. Registrujte se sa GitHub, Google ili email accountom

### Korak 2: Kreiranje Novog Projekta

1. Kliknite **"New Project"**
2. Popunite informacije:
   - **Name:** `office-booking` (ili željeno ime)
   - **Database Password:** Generirajte jaku lozinku (sačuvajte je!)
   - **Region:** Izaberite najbližu regiju
   - **Pricing Plan:** Free tier je dovoljan za početak

3. Kliknite **"Create new project"**
4. Sačekajte 2-3 minuta dok se projekat kreira

### Korak 3: Pronađite API Keys

Nakon što je projekat kreiran:

1. Idite na **Settings** → **API**
2. Kopirajte:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (`SUPABASE_SERVICE_ROLE_KEY`)

⚠️ **VAŽNO:** Čuvajte `service_role` key kao tajnu - nikad ga ne commitujte u Git!

## 🗃️ Kreiranje Database Schema

### Korak 1: Otvorite SQL Editor

1. U Supabase dashboard-u, idite na **SQL Editor**
2. Kliknite **"New Query"**

### Korak 2: Izvršite SQL Komande

Kopirajte i izvršite sljedeći SQL kod:

```sql
-- =============================================
-- OFFICE BOOKING SYSTEM - DATABASE SCHEMA
-- =============================================

-- 1️⃣ USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2️⃣ OFFICE MAP TABLE
CREATE TABLE office_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3️⃣ DESK ELEMENTS TABLE
CREATE TABLE desk_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER DEFAULT 80,
  height INTEGER DEFAULT 80,
  desk_number TEXT NOT NULL UNIQUE,
  status TEXT CHECK (status IN ('available', 'reserved', 'permanently_occupied')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4️⃣ RESERVATIONS TABLE
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  desk_id UUID NOT NULL REFERENCES desk_elements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_per_day UNIQUE(user_id, date),
  CONSTRAINT unique_desk_per_day UNIQUE(desk_id, date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_desk_id ON reservations(desk_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_user_date ON reservations(user_id, date);
CREATE INDEX idx_reservations_desk_date ON reservations(desk_id, date);

-- =============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for office_map table
CREATE TRIGGER update_office_map_updated_at
BEFORE UPDATE ON office_map
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for desk_elements table
CREATE TRIGGER update_desk_elements_updated_at
BEFORE UPDATE ON desk_elements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DEFAULT ADMIN USER
-- =============================================

-- Insert default admin user
-- Username: admin
-- Password: test123
-- Password hash generated with bcryptjs
INSERT INTO users (username, password_hash, is_admin)
VALUES ('admin', '$2a$10$rGN1JjJqJqJqJqJqJqJqJ.YZ8KxYZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K', true);

-- ⚠️ IMPORTANT: Change this password in production!
```

3. Kliknite **"Run"** da izvršite komande
4. Provjerite da nema grešaka

### Korak 3: Provjera Tabela

1. Idite na **Table Editor** u Supabase dashboard-u
2. Trebali biste vidjeti 4 tabele:
   - ✅ `users`
   - ✅ `office_map`
   - ✅ `desk_elements`
   - ✅ `reservations`

## 🔐 Row Level Security (RLS)

Za dodatnu sigurnost, omogućite RLS politike:

### Korak 1: Omogući RLS

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE desk_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
```

### Korak 2: Kreiraj Politike

```sql
-- =============================================
-- READ POLICIES (Allow public read access)
-- =============================================

CREATE POLICY "Allow public read on users" 
ON users FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on office_map" 
ON office_map FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on desk_elements" 
ON desk_elements FOR SELECT 
USING (true);

CREATE POLICY "Allow public read on reservations" 
ON reservations FOR SELECT 
USING (true);

-- =============================================
-- WRITE POLICIES (Authenticated users only)
-- =============================================

-- Users table (admin only for modifications)
CREATE POLICY "Allow authenticated insert on users" 
ON users FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on users" 
ON users FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on users" 
ON users FOR DELETE 
USING (true);

-- Office map table
CREATE POLICY "Allow authenticated insert on office_map" 
ON office_map FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on office_map" 
ON office_map FOR UPDATE 
USING (true);

-- Desk elements table
CREATE POLICY "Allow authenticated insert on desk_elements" 
ON desk_elements FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on desk_elements" 
ON desk_elements FOR UPDATE 
USING (true);

CREATE POLICY "Allow authenticated delete on desk_elements" 
ON desk_elements FOR DELETE 
USING (true);

-- Reservations table
CREATE POLICY "Allow authenticated insert on reservations" 
ON reservations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on reservations" 
ON reservations FOR DELETE 
USING (true);
```

## 🔗 Integracija sa Next.js Aplikacijom

### Korak 1: Ažurirajte Environment Varijable

Otvorite `.env.local` fajl i dodajte vaše Supabase kredencijale:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Korak 2: Ažurirajte API Routes

Zamijenite in-memory storage sa Supabase upitima u svim API route-ovima:

**Primjer za `/api/users/route.ts`:**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, is_admin, created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users }, { status: 200 })
}
```

## 📊 Test Data

Opciono, možete dodati test podatke:

```sql
-- Test users
INSERT INTO users (username, password_hash, is_admin) VALUES
('john', '$2a$10$testHashHere', false),
('jane', '$2a$10$testHashHere', false);

-- Sample desks
INSERT INTO desk_elements (x, y, desk_number, status) VALUES
(100, 100, 'A1', 'available'),
(200, 100, 'A2', 'available'),
(300, 100, 'A3', 'permanently_occupied'),
(100, 200, 'B1', 'available'),
(200, 200, 'B2', 'available');
```

## 🎯 Best Practices

1. **Environment Variables**
   - Nikad ne commitujte `.env.local` u Git
   - Koristite različite Supabase projekte za dev/prod
   - Rotirajte API keys periodično

2. **Database Optimizacija**
   - Koristite indexe za često pretraživane kolone
   - Postavite appropriate constraints
   - Pravite backup periodično

3. **Sigurnost**
   - Omogućite RLS na svim tabelama
   - Koristite parametrizovane upite
   - Validirajte input na klijent i server strani

## 🔍 Monitoring & Analytics

1. **Database Statistics**
   - Idite na **Database** → **Statistics** u Supabase
   - Pratite broj upita, performanse, storage

2. **API Logs**
   - Idite na **Logs** → **API Logs**
   - Pratite greške i performanse API poziva

## 📞 Pomoć

Ako imate problema:
1. Provjerite [Supabase dokumentaciju](https://supabase.com/docs)
2. Posjetite [Supabase Discord](https://discord.supabase.com)
3. Pogledajte [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Sretno sa setup-om! 🚀**

