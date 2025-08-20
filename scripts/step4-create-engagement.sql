-- Step 4: Create engagement_log table
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