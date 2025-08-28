-- CLEAN UP DEMO DATA AND SET UP PRODUCTION RAFFLE
-- Run this script in Supabase to clean demo data and set up a real raffle

-- Step 1: Clean all existing demo data
DELETE FROM engagement_log;
DELETE FROM user_tickets;
DELETE FROM raffles;

-- Step 2: Create a real active raffle for production
INSERT INTO raffles (
  "weekPeriod",
  "startDate", 
  "endDate",
  "totalPool",
  "totalParticipants",
  "totalTickets",
  "status",
  "createdAt"
) VALUES (
  'Week 35 2024', -- Current week
  '2024-08-26T00:00:00.000Z', -- Monday start
  '2024-09-01T23:59:59.000Z', -- Sunday end  
  1000, -- 1000 DEGEN total pool
  0, -- No participants yet
  0, -- No tickets yet
  'ACTIVE', -- Active status
  NOW() -- Created now
);

-- Step 3: Verify the setup
SELECT 
  id,
  "weekPeriod", 
  status,
  "totalParticipants",
  "totalTickets",
  "totalPool",
  "startDate",
  "endDate"
FROM raffles 
WHERE status = 'ACTIVE';

-- This should show:
-- - One active raffle for current week
-- - 0 participants, 0 tickets initially
-- - Ready for real users to participate