-- Simple version: Add columns without enum first
-- Run this if the main script fails

-- Add columns without enum constraints first
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "raffleType" TEXT DEFAULT 'BIWEEKLY';
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "dayNumber" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "prizeAmount" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "winningTicketNumber" INTEGER;
ALTER TABLE "raffles" ADD COLUMN IF NOT EXISTS "selectionAlgorithm" TEXT;

-- Update existing records
UPDATE "raffles"
SET "raffleType" = CASE
    WHEN "dayNumber" IS NOT NULL THEN 'DAILY'
    ELSE 'BIWEEKLY'
END
WHERE "raffleType" IS NULL;

-- Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'raffles'
AND column_name IN ('raffleType', 'dayNumber', 'prizeAmount', 'winningTicketNumber', 'selectionAlgorithm');