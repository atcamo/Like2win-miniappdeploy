-- Step 3: Create user_tickets table
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