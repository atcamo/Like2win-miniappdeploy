-- UPDATE RAFFLE DATES TO INCLUDE HISTORICAL PERIOD
-- This extends the current raffle to cover the historical period from August 18

-- Update the current active raffle to start from August 18
UPDATE raffles 
SET 
  "startDate" = '2024-08-18T00:00:00.000Z',  -- Start from August 18
  "endDate" = '2024-09-08T23:59:59.000Z',    -- Extend end date to give more time
  "weekPeriod" = 'Week 34-36 2024 (Historical + Current)'  -- Update period name
WHERE status = 'ACTIVE';

-- Verify the update
SELECT 
  id,
  "weekPeriod",
  "startDate",
  "endDate", 
  status,
  "totalParticipants",
  "totalTickets",
  "totalPool"
FROM raffles 
WHERE status = 'ACTIVE';

-- This should show:
-- - Start date: August 18, 2024
-- - End date: September 8, 2024 
-- - Updated period name to reflect historical inclusion