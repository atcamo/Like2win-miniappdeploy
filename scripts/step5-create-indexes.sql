-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS idx_raffles_week_period ON raffles(week_period);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_user_tickets_raffle ON user_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_user_tickets_user ON user_tickets(user_fid);
CREATE INDEX IF NOT EXISTS idx_engagement_raffle ON engagement_log(raffle_id);
CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_log(user_fid);
CREATE INDEX IF NOT EXISTS idx_engagement_cast ON engagement_log(cast_hash);