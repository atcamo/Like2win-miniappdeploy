-- Initialize production database for Like2Win
-- Execute this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  fid BIGINT PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  pfp_url TEXT,
  tip_allowance_enabled BOOLEAN DEFAULT false,
  is_following_like2_win BOOLEAN DEFAULT false,
  total_lifetime_tickets INTEGER DEFAULT 0,
  total_winnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create raffles table
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

-- Create user_tickets table
CREATE TABLE IF NOT EXISTS user_tickets (
  id SERIAL PRIMARY KEY,
  raffle_id TEXT REFERENCES raffles(id),
  user_fid BIGINT,
  tickets_count INTEGER DEFAULT 0,
  first_like_at TIMESTAMP,
  last_like_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(raffle_id, user_fid)
);

-- Create engagement_log table
CREATE TABLE IF NOT EXISTS engagement_log (
  id SERIAL PRIMARY KEY,
  raffle_id TEXT REFERENCES raffles(id),
  user_fid BIGINT,
  cast_hash TEXT NOT NULL,
  has_liked BOOLEAN DEFAULT false,
  has_commented BOOLEAN DEFAULT false,
  has_recasted BOOLEAN DEFAULT false,
  has_tip_allowance BOOLEAN DEFAULT false,
  ticket_awarded BOOLEAN DEFAULT false,
  ticket_awarded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(cast_hash, user_fid)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_raffles_week_period ON raffles(week_period);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_user_tickets_raffle ON user_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_user ON user_tickets(user_fid);
CREATE INDEX IF NOT EXISTS idx_engagement_raffle ON engagement_log(raffle_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_log(user_fid);
CREATE INDEX IF NOT EXISTS idx_engagement_cast ON engagement_log(cast_hash);

-- Insert first active raffle
INSERT INTO raffles (
  id,
  week_period,
  start_date,
  end_date,
  total_pool,
  founder_contribution,
  status,
  created_at
) VALUES (
  gen_random_uuid()::text,
  '2025-W03',
  '2025-01-13 00:00:00'::timestamp,
  '2025-01-26 23:59:59'::timestamp,
  50000,
  50000,
  'ACTIVE',
  now()
) ON CONFLICT (week_period) DO NOTHING;

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'raffles', 'user_tickets', 'engagement_log')
ORDER BY tablename;