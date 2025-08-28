-- FIX RAFFLE TIMING ISSUE
-- Update current raffle to have proper dates

-- First, let's check what we currently have
SELECT 
  id,
  "weekPeriod",
  "startDate",
  "endDate",
  status,
  (EXTRACT(EPOCH FROM ("endDate" - NOW())) / 3600) as hours_remaining,
  CASE 
    WHEN NOW() < "startDate" THEN 'Not Started Yet'
    WHEN NOW() > "endDate" THEN 'Finished'  
    ELSE 'Active'
  END as calculated_status
FROM raffles 
WHERE status = 'ACTIVE';

-- Update the raffle to have proper timing
-- Start from August 18 to include historical data
-- End on September 15 to give plenty of time
UPDATE raffles 
SET 
  "startDate" = '2024-08-18T00:00:00.000Z',
  "endDate" = '2024-09-15T23:59:59.000Z',
  "weekPeriod" = 'Week 34-37 2024 (Launch Raffle)'
WHERE status = 'ACTIVE';

-- Verify the fix
SELECT 
  id,
  "weekPeriod",
  "startDate",
  "endDate",
  status,
  ROUND(EXTRACT(EPOCH FROM ("endDate" - NOW())) / 86400, 1) as days_remaining,
  CASE 
    WHEN NOW() < "startDate" THEN '⏳ Not Started'
    WHEN NOW() > "endDate" THEN '🏁 Finished'  
    ELSE '✅ Active'
  END as calculated_status
FROM raffles 
WHERE status = 'ACTIVE';

-- Expected result:
-- - weekPeriod: "Week 34-37 2024 (Launch Raffle)"
-- - calculated_status: "✅ Active" 
-- - days_remaining: ~18 days (until September 15)