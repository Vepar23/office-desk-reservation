-- ================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Izvršite ovaj SQL u Supabase SQL Editor-u
-- ================================================================

-- VAŽNO: Pošto aplikacija koristi custom authentication (ne Supabase Auth),
-- RLS policies će koristiti service_role_key za bypass.
-- Zato je KRITIČNO da backend (API routes) implementira validation!

-- ================================================================
-- 1. OMOGUĆI RLS NA SVIM TABELAMA
-- ================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE desk_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE office_map ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 2. USERS TABELA
-- ================================================================

-- Obriši postojeće policies ako postoje
DROP POLICY IF EXISTS "Service role can do everything on users" ON users;

-- Service role (backend) može sve
CREATE POLICY "Service role can do everything on users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- 3. DESK_ELEMENTS TABELA
-- ================================================================

DROP POLICY IF EXISTS "Service role can do everything on desk_elements" ON desk_elements;

CREATE POLICY "Service role can do everything on desk_elements" ON desk_elements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- 4. RESERVATIONS TABELA
-- ================================================================

DROP POLICY IF EXISTS "Service role can do everything on reservations" ON reservations;

CREATE POLICY "Service role can do everything on reservations" ON reservations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- 5. OFFICE_MAP TABELA
-- ================================================================

DROP POLICY IF EXISTS "Service role can do everything on office_map" ON office_map;

CREATE POLICY "Service role can do everything on office_map" ON office_map
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- NAPOMENA
-- ================================================================

-- Ove policies omogućavaju service_role_key-u da ima pun pristup.
-- ZATO JE KRITIČNO da backend (Next.js API routes) implementira:
--   1. Authentication check (da li je user ulogovan)
--   2. Authorization check (da li user ima pravo da pristupi podacima)
--   3. Validation (da li su podaci validni)

-- Backend MORA da proveri:
--   - Da korisnik može da vidi samo svoje rezervacije
--   - Da korisnik može da briše samo svoje rezervacije
--   - Da samo admin može da briše/menja korisnike i desk_elements
--   - Da samo admin može da upload-uje office map

-- ================================================================
-- VERIFIKACIJA
-- ================================================================

-- Proverite da su RLS policies omogućeni:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'desk_elements', 'reservations', 'office_map');

-- Svi treba da imaju rowsecurity = true

-- Proverite policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public';

-- ================================================================
-- DODATNE SIGURNOSNE MERE
-- ================================================================

-- 1. Kreiraj indekse za brže upite (ako već ne postoje):
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_desk_id ON reservations(desk_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_desk_elements_status ON desk_elements(status);

-- 2. Dodaj constraint-e za data integrity:
ALTER TABLE reservations 
  ADD CONSTRAINT check_date_format 
  CHECK (date ~ '^\d{4}-\d{2}-\d{2}$');

-- 3. Dodaj constraint za username:
ALTER TABLE users 
  ADD CONSTRAINT check_username_length 
  CHECK (length(username) >= 3);

-- ================================================================
-- ZAVRŠENO
-- ================================================================

-- RLS je sada omogućen, ali backend MORA da implementira validation!
-- Proverite SECURITY_AUDIT_REPORT.md za više detalja.

