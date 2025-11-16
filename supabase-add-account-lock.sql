-- ================================================================
-- MIGRATION: Dodavanje Account Lock funkcionalnosti
-- ================================================================
-- Ovaj SQL dodaje kolone za:
-- 1. Lockanje accounta nakon 5 neuspjelih pokušaja logina
-- 2. Admin mogućnost da unlockuje accounte
-- ================================================================

-- Dodaj nove kolone u users tabelu
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_attempt TIMESTAMP WITH TIME ZONE;

-- Postavi default vrijednosti za postojeće korisnike
UPDATE users 
SET 
  locked = false,
  failed_login_attempts = 0
WHERE locked IS NULL OR failed_login_attempts IS NULL;

-- Kreiraj index za brže query-e
CREATE INDEX IF NOT EXISTS idx_users_locked ON users(locked);

-- Verifikacija
SELECT 
  username, 
  is_admin, 
  locked, 
  failed_login_attempts,
  last_login_attempt
FROM users
ORDER BY is_admin DESC, username;

-- ✅ Kolone uspješno dodane!
-- 
-- NAPOMENA:
-- - Svi postojeći korisnici imaju locked = false
-- - failed_login_attempts = 0
-- - Aplikacija će automatski započeti tracking

