-- Step 7: Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'raffles', 'user_tickets', 'engagement_log')
ORDER BY tablename;