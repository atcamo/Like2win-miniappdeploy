-- Create Demo Raffle for Like2Win Interface Testing
-- Fixed version for Supabase SQL Editor

-- First, check if there's already an active raffle
SELECT id, "weekPeriod", "startDate", "endDate", status 
FROM raffles 
WHERE status = 'ACTIVE' 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Create the demo raffle
INSERT INTO raffles (
  "weekPeriod",
  "startDate", 
  "endDate",
  "tipsReceived",
  "userContribution",
  "founderContribution",
  "operationalFee",
  "totalPool",
  "isSelfSustaining",
  "totalParticipants",
  "totalTickets",
  status,
  "createdAt"
) VALUES (
  '2024-P35',                          -- Current bi-weekly period
  '2024-08-26T00:00:00.000Z',         -- Start date (Monday)
  '2024-09-16T23:59:59.000Z',         -- End date (3 weeks later)
  0,                                   -- tipsReceived
  0,                                   -- userContribution  
  100000,                              -- founderContribution (100k $DEGEN)
  10000,                               -- operationalFee (10k $DEGEN)
  90000,                               -- totalPool (90k $DEGEN available)
  false,                               -- isSelfSustaining
  4,                                   -- totalParticipants
  38,                                  -- totalTickets
  'ACTIVE',                            -- status
  NOW()                                -- createdAt
) 
ON CONFLICT ("weekPeriod") 
DO UPDATE SET
  "endDate" = EXCLUDED."endDate",
  "totalPool" = EXCLUDED."totalPool",
  "totalParticipants" = EXCLUDED."totalParticipants",
  "totalTickets" = EXCLUDED."totalTickets",
  status = EXCLUDED.status;

-- Create demo user tickets - Execute these one by one
-- Demo participant 1 (main test user)
INSERT INTO user_tickets (
    "raffleId",
    "userFid", 
    "ticketsCount",
    "firstLikeAt",
    "lastLikeAt"
) 
SELECT 
    r.id as "raffleId",
    123456 as "userFid",
    15 as "ticketsCount",
    NOW() - INTERVAL '2 days' as "firstLikeAt",
    NOW() - INTERVAL '1 hour' as "lastLikeAt"
FROM raffles r 
WHERE r.status = 'ACTIVE' 
LIMIT 1
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET 
    "ticketsCount" = EXCLUDED."ticketsCount",
    "lastLikeAt" = EXCLUDED."lastLikeAt";

-- Demo participant 2
INSERT INTO user_tickets (
    "raffleId",
    "userFid", 
    "ticketsCount",
    "firstLikeAt",
    "lastLikeAt"
) 
SELECT 
    r.id as "raffleId",
    789012 as "userFid",
    12 as "ticketsCount",
    NOW() - INTERVAL '3 days' as "firstLikeAt",
    NOW() - INTERVAL '30 minutes' as "lastLikeAt"
FROM raffles r 
WHERE r.status = 'ACTIVE' 
LIMIT 1
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET 
    "ticketsCount" = EXCLUDED."ticketsCount";

-- Demo participant 3
INSERT INTO user_tickets (
    "raffleId",
    "userFid", 
    "ticketsCount",
    "firstLikeAt",
    "lastLikeAt"
) 
SELECT 
    r.id as "raffleId",
    345678 as "userFid",
    8 as "ticketsCount",
    NOW() - INTERVAL '1 day' as "firstLikeAt",
    NOW() - INTERVAL '2 hours' as "lastLikeAt"
FROM raffles r 
WHERE r.status = 'ACTIVE' 
LIMIT 1
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET 
    "ticketsCount" = EXCLUDED."ticketsCount";

-- Demo participant 4
INSERT INTO user_tickets (
    "raffleId",
    "userFid", 
    "ticketsCount",
    "firstLikeAt",
    "lastLikeAt"
) 
SELECT 
    r.id as "raffleId",
    901234 as "userFid",
    3 as "ticketsCount",
    NOW() - INTERVAL '5 hours' as "firstLikeAt",
    NOW() - INTERVAL '10 minutes' as "lastLikeAt"
FROM raffles r 
WHERE r.status = 'ACTIVE' 
LIMIT 1
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET 
    "ticketsCount" = EXCLUDED."ticketsCount";

-- Verify the setup - Active raffle
SELECT 
    r.id,
    r."weekPeriod",
    r."startDate",
    r."endDate", 
    r."totalPool",
    r."totalParticipants",
    r."totalTickets",
    r.status
FROM raffles r 
WHERE r.status = 'ACTIVE';

-- Verify the setup - Demo participants
SELECT 
    ut."userFid",
    ut."ticketsCount",
    ut."firstLikeAt",
    ut."lastLikeAt",
    ROUND((ut."ticketsCount"::decimal / r."totalTickets" * 100), 2) as probability_percent
FROM user_tickets ut
JOIN raffles r ON r.id = ut."raffleId"
WHERE r.status = 'ACTIVE'
ORDER BY ut."ticketsCount" DESC;