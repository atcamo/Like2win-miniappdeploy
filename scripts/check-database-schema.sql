-- CHECK DATABASE SCHEMA
-- Run this first to see what columns actually exist

-- Check raffles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'raffles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check user_tickets table structure  
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_tickets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check engagement_log table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'engagement_log' 
  AND table_schema = 'public'
ORDER BY ordinal_position;