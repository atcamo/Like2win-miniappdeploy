-- Enable Row Level Security (RLS) on all tables
-- This SQL script will enable RLS on all tables exposed to PostgREST

-- Enable RLS on raffles table  
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;

-- Create policy for raffles table (allow public read access)
CREATE POLICY "Public read access to raffles" ON raffles
FOR SELECT USING (true);

-- Create policy for raffle mutations (authenticated users only)
CREATE POLICY "Authenticated users can modify raffles" ON raffles
FOR ALL USING (auth.role() = 'authenticated');

-- Enable RLS on user_tickets table
ALTER TABLE user_tickets ENABLE ROW LEVEL SECURITY;

-- Create policy for user_tickets table (users can see their own tickets)
CREATE POLICY "Users can access their own tickets" ON user_tickets
FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE users.fid = user_tickets."userFid" 
    AND (auth.uid()::text = users.id OR auth.uid() IS NULL)
));

-- Enable RLS on prisma_users table (legacy table)
ALTER TABLE prisma_users ENABLE ROW LEVEL SECURITY;

-- Create policy for prisma_users table
CREATE POLICY "Legacy users table access" ON prisma_users
FOR ALL USING (auth.uid() IS NULL OR auth.role() = 'service_role');

-- Enable RLS on engagement_log table
ALTER TABLE engagement_log ENABLE ROW LEVEL SECURITY;

-- Create policy for engagement_log table (users can see their own engagement)
CREATE POLICY "Users can access their own engagement" ON engagement_log
FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE users.fid = engagement_log.user_fid
    AND (auth.uid()::text = users.id OR auth.uid() IS NULL)
));

-- Create policy for public read access to engagement stats
CREATE POLICY "Public read access to engagement stats" ON engagement_log
FOR SELECT USING (true);