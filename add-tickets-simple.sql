-- Add tickets directly for testing
-- Execute in Supabase SQL Editor

INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
VALUES ('078adf95-4cc1-4569-9343-0337eb2ba356', 546204, 3)
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + 3;