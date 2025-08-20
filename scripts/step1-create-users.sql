-- Step 1: Create users table
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