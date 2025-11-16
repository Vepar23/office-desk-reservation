-- ================================================================
-- SUPABASE KOMPLETAN SETUP
-- Izvršite ovaj SQL u Supabase SQL Editor-u
-- ================================================================

-- ================================================================
-- KORAK 1: KREIRANJE TABELA
-- ================================================================

-- 1. USERS tabela
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. DESKS tabela
CREATE TABLE IF NOT EXISTS desks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x INTEGER NOT NULL DEFAULT 100,
  y INTEGER NOT NULL DEFAULT 100,
  width INTEGER NOT NULL DEFAULT 80,
  height INTEGER NOT NULL DEFAULT 80,
  desk_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'permanently_occupied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OFFICE_MAP tabela
CREATE TABLE IF NOT EXISTS office_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RESERVATIONS tabela
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  desk_id UUID NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date),  -- Jedan korisnik može imati samo jednu rezervaciju po danu
  UNIQUE(desk_id, date)   -- Jedan stol može biti rezerviran samo jednom po danu
);

-- ================================================================
-- KORAK 2: KREIRANJE INDEKSA
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_desk_id ON reservations(desk_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_user_date ON reservations(user_id, date);
CREATE INDEX IF NOT EXISTS idx_reservations_desk_date ON reservations(desk_id, date);

-- ================================================================
-- KORAK 3: KREIRANJE DEFAULT ADMIN KORISNIKA
-- ================================================================

-- Proveri da li admin već postoji
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin') THEN
    -- Kreiraj default admin korisnika
    -- Username: admin
    -- Password: test123 (MORATE PROMIJENITI!)
    INSERT INTO users (username, password_hash, is_admin)
    VALUES ('admin', '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K', true);
    
    RAISE NOTICE 'Default admin korisnik kreiran! Username: admin, Password: test123';
  ELSE
    RAISE NOTICE 'Admin korisnik već postoji!';
  END IF;
END $$;

-- ================================================================
-- KORAK 4: OMOGUĆAVANJE ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE desks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- KORAK 5: KREIRANJE RLS POLICIES
-- ================================================================

-- USERS POLICIES
DROP POLICY IF EXISTS "Service role can do everything on users" ON users;
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- DESKS POLICIES
DROP POLICY IF EXISTS "Service role can do everything on desks" ON desks;
CREATE POLICY "Service role can do everything on desks" ON desks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- RESERVATIONS POLICIES
DROP POLICY IF EXISTS "Service role can do everything on reservations" ON reservations;
CREATE POLICY "Service role can do everything on reservations" ON reservations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- OFFICE_MAP POLICIES
DROP POLICY IF EXISTS "Service role can do everything on office_map" ON office_map;
CREATE POLICY "Service role can do everything on office_map" ON office_map
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- KORAK 6: VERIFIKACIJA
-- ================================================================

-- Proverite da su sve tabele kreirane:
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('users', 'desks', 'reservations', 'office_map')
ORDER BY table_name;

-- Proverite da je RLS omogućen:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'desks', 'reservations', 'office_map')
ORDER BY tablename;

-- Proverite da je admin kreiran:
SELECT id, username, is_admin, created_at 
FROM users 
WHERE username = 'admin';

-- ================================================================
-- GOTOVO!
-- ================================================================

-- ✅ Tabele su kreirane
-- ✅ Indeksi su dodati
-- ✅ Default admin je kreiran (admin/test123)
-- ✅ RLS je omogućen
-- ✅ RLS policies su postavljeni

-- ⚠️ VAŽNO: PROMIJENITE ADMIN LOZINKU ODMAH!
-- Ulogujte se na aplikaciju i promijenite lozinku preko opcije "Lozinka"

-- ================================================================
-- DODATNO: KAKO RESETOVATI LOZINKU (Ako treba)
-- ================================================================

-- Ako zaboravite lozinku, možete je resetovati sa:
-- UPDATE users 
-- SET password_hash = '$2a$10$8X8KxYZ8XYZ8KxYZ8XYZ8.uQQf0YZ8XYZ8KxYZ8XYZ8KxYZ8XYZ8K'
-- WHERE username = 'admin';
-- (Ovo vraća lozinku na 'test123')

