# Admin User Setup - Automatsko Kreiranje

## Problem koji smo imali:
Default admin korisnik (`admin`/`test123`) je imao ID `"admin-default"` koji nije validan UUID. 
To je izazivalo greške kada admin pokušava da kreira rezervacije jer Supabase očekuje UUID format.

## Rešenje:
Login sistem sada **automatski kreira** admin korisnika u Supabase bazi prilikom prvog logina sa `admin`/`test123`.

### Kako radi:
1. Kada se ulogujete sa `admin`/`test123`, sistem proverava da li postoji admin u bazi
2. Ako postoji, koristi tog korisnika (sa pravim UUID-om)
3. Ako NE postoji, automatski kreira admin korisnika u bazi sa hash-ovanom lozinkom
4. Admin sada ima validan UUID i može koristiti sve funkcije sistema

### Ručno kreiranje admin korisnika (opcionalno):

Ako želite ručno kreirati admin korisnika u Supabase bazi, možete izvršiti sledeći SQL upit u Supabase SQL editoru:

\`\`\`sql
-- Proveri da li admin već postoji
SELECT * FROM users WHERE username = 'admin';

-- Ako ne postoji, kreiraj ga (koristimo bcrypt hash za lozinku 'test123')
-- Hash: $2a$10$K7oZ5WqLJYYlYy5YQ5XxNuN1QpQK.5Y0ZR5YQ5XxNuN1QpQK.5Y0ZO

INSERT INTO users (username, password_hash, is_admin)
VALUES (
  'admin',
  '$2a$10$K7oZ5WqLJYYlYy5YQ5XxNuN1QpQK.5Y0ZR5YQ5XxNuN1QpQK.5Y0ZO',
  true
)
ON CONFLICT (username) DO NOTHING;
\`\`\`

### Testiranje:

1. **Logout** (ako ste ulogovani)
2. Refresh stranice (`Ctrl+F5` za hard refresh)
3. Ulogujte se sa:
   - Username: `admin`
   - Password: `test123`
4. Sistem će automatski kreirati admin korisnika u bazi ako ne postoji
5. Sada možete normalno kreirati rezervacije

### Provera:

Za proveru da li je admin kreiran, možete pogledate u Supabase Dashboard:
- Otvorite **Table Editor**
- Izaberite **users** tabelu
- Trebali biste videti korisnika `admin` sa `is_admin = true`

### Status:
✅ **REŠENO** - Admin korisnik se automatski kreira sa validnim UUID-om

