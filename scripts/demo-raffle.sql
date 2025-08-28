-- Create Demo Raffle for Like2Win Interface Testing
-- Run this in Supabase SQL Editor

-- First, check if there's already an active raffle
SELECT id, "weekPeriod", "startDate", "endDate", status 
FROM raffles 
WHERE status = 'ACTIVE' 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- If no active raffle exists, create one
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
  1,                                   -- totalParticipants (demo user)
  15,                                  -- totalTickets (demo tickets)
  'ACTIVE',                            -- status
  NOW()                                -- createdAt
) 
ON CONFLICT ("weekPeriod") 
DO UPDATE SET
  "endDate" = EXCLUDED."endDate",
  "totalPool" = EXCLUDED."totalPool",
  status = EXCLUDED.status
RETURNING id, "weekPeriod", "totalPool";

-- Get the raffle ID for demo tickets
DO $$
DECLARE
    raffle_id UUID;
    demo_fid BIGINT := 123456;
BEGIN
    -- Get the active raffle ID
    SELECT id INTO raffle_id 
    FROM raffles 
    WHERE status = 'ACTIVE' 
    ORDER BY "createdAt" DESC 
    LIMIT 1;
    
    -- Create demo user tickets
    INSERT INTO user_tickets (
        "raffleId",
        "userFid", 
        "ticketsCount",
        "firstLikeAt",
        "lastLikeAt"
    ) VALUES (
        raffle_id,
        demo_fid,
        15,                             -- 15 demo tickets
        NOW() - INTERVAL '2 days',      -- firstLikeAt (2 days ago)
        NOW() - INTERVAL '1 hour'       -- lastLikeAt (1 hour ago)
    )
    ON CONFLICT ("raffleId", "userFid") 
    DO UPDATE SET 
        "ticketsCount" = EXCLUDED."ticketsCount",
        "lastLikeAt" = EXCLUDED."lastLikeAt";
        
    RAISE NOTICE 'Created demo tickets for FID % in raffle %', demo_fid, raffle_id;
END $$;

-- Create a few more demo participants for leaderboard
DO $$
DECLARE
    raffle_id UUID;
BEGIN
    SELECT id INTO raffle_id FROM raffles WHERE status = 'ACTIVE' LIMIT 1;
    
    -- Demo participant 2
    INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "firstLikeAt", "lastLikeAt") 
    VALUES (raffle_id, 789012, 8, NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 hours')
    ON CONFLICT ("raffleId", "userFid") DO UPDATE SET "ticketsCount" = EXCLUDED."ticketsCount";
    
    -- Demo participant 3
    INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "firstLikeAt", "lastLikeAt") 
    VALUES (raffle_id, 345678, 12, NOW() - INTERVAL '3 days', NOW() - INTERVAL '30 minutes')
    ON CONFLICT ("raffleId", "userFid") DO UPDATE SET "ticketsCount" = EXCLUDED."ticketsCount";
    
    -- Demo participant 4
    INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "firstLikeAt", "lastLikeAt") 
    VALUES (raffle_id, 901234, 3, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '10 minutes')
    ON CONFLICT ("raffleId", "userFid") DO UPDATE SET "ticketsCount" = EXCLUDED."ticketsCount";
    
    -- Update raffle totals
    UPDATE raffles 
    SET 
        "totalParticipants" = 4,
        "totalTickets" = 15 + 8 + 12 + 3
    WHERE id = raffle_id;
    
    RAISE NOTICE 'Created demo raffle with 4 participants and 38 total tickets';
END $$;

-- Verify the setup
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

-- Show demo participants
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