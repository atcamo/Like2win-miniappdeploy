-- FIX RAFFLE YEAR TO 2025
-- Update raffle dates to current year (2025)

-- Update the raffle with correct 2025 dates
UPDATE raffles 
SET 
  "startDate" = '2025-08-18T00:00:00.000Z',  -- August 18, 2025
  "endDate" = '2025-09-15T23:59:59.000Z',    -- September 15, 2025  
  "weekPeriod" = 'Week 34-37 2025 (Launch Raffle)'
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
    WHEN NOW() < "startDate" THEN '⏳ Not Started Yet'
    WHEN NOW() > "endDate" THEN '🏁 Finished'  
    ELSE '✅ Active'
  END as calculated_status
FROM raffles 
WHERE status = 'ACTIVE';

-- Expected result:
-- - weekPeriod: "Week 34-37 2025 (Launch Raffle)"
-- - calculated_status: "✅ Active" 
-- - days_remaining: ~18 days (until September 15, 2025)