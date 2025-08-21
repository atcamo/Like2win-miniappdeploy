-- Check the actual schema of database tables
-- Execute each query separately in Supabase SQL Editor

-- 1. Check user_tickets table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_tickets';

-- 2. Check engagement_log table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'engagement_log';

-- 3. Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';

-- 4. Check raffles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'raffles';