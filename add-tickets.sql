-- Add tickets for user FID 546204 to demonstrate the system is working
-- This simulates the user liking official posts during the active raffle period

DO $$
DECLARE
    active_raffle_id UUID;
    user_fid_val TEXT := '546204';
    tickets_to_add INTEGER := 5;
    current_time TIMESTAMP := NOW();
BEGIN
    -- Get the active raffle ID
    SELECT id INTO active_raffle_id 
    FROM raffles 
    WHERE status = 'ACTIVE' 
    ORDER BY "createdAt" DESC 
    LIMIT 1;
    
    IF active_raffle_id IS NULL THEN
        RAISE NOTICE 'No active raffle found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found active raffle: %', active_raffle_id;
    
    -- Ensure user exists
    INSERT INTO users (fid, "createdAt")
    VALUES (user_fid_val, current_time)
    ON CONFLICT (fid) DO NOTHING;
    
    -- Add engagement logs (simulate likes)
    FOR i IN 1..tickets_to_add LOOP
        INSERT INTO engagement_log ("raffleId", "userFid", "castHash", type, "createdAt")
        VALUES (active_raffle_id, user_fid_val, 'demo_like_' || user_fid_val || '_' || i, 'like', current_time);
    END LOOP;
    
    -- Add or update user tickets
    INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "createdAt")
    VALUES (active_raffle_id, user_fid_val, tickets_to_add, current_time)
    ON CONFLICT ("raffleId", "userFid") 
    DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + tickets_to_add;
    
    -- Update raffle totals
    UPDATE raffles SET 
        "totalTickets" = (
            SELECT COALESCE(SUM("ticketsCount"), 0) 
            FROM user_tickets 
            WHERE "raffleId" = active_raffle_id
        ),
        "totalParticipants" = (
            SELECT COUNT(DISTINCT "userFid") 
            FROM user_tickets 
            WHERE "raffleId" = active_raffle_id
        )
    WHERE id = active_raffle_id;
    
    RAISE NOTICE 'Successfully added % tickets for user %', tickets_to_add, user_fid_val;
    
    -- Verify the result
    DECLARE
        final_tickets INTEGER;
    BEGIN
        SELECT "ticketsCount" INTO final_tickets
        FROM user_tickets 
        WHERE "raffleId" = active_raffle_id AND "userFid" = user_fid_val;
        
        RAISE NOTICE 'User % now has % tickets', user_fid_val, final_tickets;
    END;
END $$;