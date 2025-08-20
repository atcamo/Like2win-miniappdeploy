-- Crear tabla raffles si no existe
CREATE TABLE IF NOT EXISTS raffles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  week_period TEXT UNIQUE NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  tips_received INTEGER DEFAULT 0,
  user_contribution INTEGER DEFAULT 0,
  founder_contribution INTEGER DEFAULT 0,
  operational_fee INTEGER DEFAULT 0,
  total_pool INTEGER DEFAULT 0,
  is_self_sustaining BOOLEAN DEFAULT false,
  total_participants INTEGER DEFAULT 0,
  total_tickets INTEGER DEFAULT 0,
  first_place_fid BIGINT,
  second_place_fid BIGINT,
  third_place_fid BIGINT,
  first_prize INTEGER,
  second_prize INTEGER,
  third_prize INTEGER,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DRAWING', 'COMPLETED')),
  random_seed TEXT,
  executed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Crear índices para raffles
CREATE INDEX IF NOT EXISTS idx_raffles_week_period ON raffles(week_period);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);

-- Verificar que la tabla se creó
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_name = 'raffles' AND table_schema = 'public';