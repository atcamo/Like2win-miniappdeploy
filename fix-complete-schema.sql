-- Complete database schema fix for Like2Win GitHub Actions
-- This fixes all missing columns causing automation failures

-- =========================================
-- 1. Fix raffles table
-- =========================================

-- Create RaffleType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RaffleType') THEN
        CREATE TYPE "RaffleType" AS ENUM ('BIWEEKLY', 'DAILY');
    END IF;
END $$;

-- Add missing columns to raffles table
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "raffleType" "RaffleType" DEFAULT 'BIWEEKLY';
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "dayNumber" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "prizeAmount" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "winningTicketNumber" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "selectionAlgorithm" TEXT;

-- Update existing raffles records
UPDATE "raffles"
SET "raffleType" = CASE
    WHEN "dayNumber" IS NOT NULL THEN 'DAILY'::"RaffleType"
    ELSE 'BIWEEKLY'::"RaffleType"
END
WHERE "raffleType" IS NULL;

-- =========================================
-- 2. Fix user_tickets table
-- =========================================

-- Add tickets column to user_tickets table
ALTER TABLE "user_tickets" ADD COLUMN IF NOT EXISTS "tickets" INTEGER DEFAULT 0;

-- Copy data from ticketsCount to tickets for existing records
UPDATE "user_tickets"
SET "tickets" = "ticketsCount"
WHERE "tickets" = 0 AND "ticketsCount" > 0;

-- Create index for tickets column if it doesn't exist
CREATE INDEX IF NOT EXISTS "user_tickets_tickets_idx" ON "user_tickets"("tickets");

-- =========================================
-- 3. Verification
-- =========================================

-- Verify raffles table columns
SELECT 'raffles' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'raffles'
AND column_name IN ('raffleType', 'dayNumber', 'prizeAmount', 'winningTicketNumber', 'selectionAlgorithm')

UNION ALL

-- Verify user_tickets table columns
SELECT 'user_tickets' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_tickets'
AND column_name IN ('tickets', 'ticketsCount')

ORDER BY table_name, column_name;