-- ================================================================
-- MIGRATION: Dodavanje desk exemptions funkcionalnosti
-- ================================================================
-- Omogućava oslobađanje trajno rezerviranih mjesta za specifične datume
-- ================================================================

-- Kreiraj desk_exemptions tabelu
CREATE TABLE IF NOT EXISTS desk_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  desk_id UUID NOT NULL REFERENCES desk_elements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(desk_id, date)  -- Jedno mjesto može biti oslobođeno samo jednom za svaki datum
);

-- Kreiraj indekse za brže upite
CREATE INDEX IF NOT EXISTS idx_desk_exemptions_desk_id ON desk_exemptions(desk_id);
CREATE INDEX IF NOT EXISTS idx_desk_exemptions_date ON desk_exemptions(date);
CREATE INDEX IF NOT EXISTS idx_desk_exemptions_desk_date ON desk_exemptions(desk_id, date);

-- Omogući Row Level Security
ALTER TABLE desk_exemptions ENABLE ROW LEVEL SECURITY;

-- Kreiraj RLS policy
DROP POLICY IF EXISTS "Service role can do everything on desk_exemptions" ON desk_exemptions;
CREATE POLICY "Service role can do everything on desk_exemptions" ON desk_exemptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verifikacija
SELECT 
  table_name, 
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'desk_exemptions') as column_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'desk_exemptions';

-- ✅ Tabela uspješno kreirana!
-- 
-- NAPOMENA:
-- - Trajno rezervirana mjesta se mogu osloboditi za specifične datume
-- - Exemptions omogućavaju rezervaciju na dan kada je mjesto oslobođeno
-- - Svako mjesto može imati samo jedno oslobađanje po datumu

