-- Add missing columns to raffles table
-- This fixes the GitHub Action error by syncing DB with Prisma schema

-- First, check if the enum exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RaffleType') THEN
        CREATE TYPE "RaffleType" AS ENUM ('BIWEEKLY', 'DAILY');
    END IF;
END $$;

-- Add the raffleType column with default value
ALTER TABLE "raffles"
ADD COLUMN IF NOT EXISTS "raffleType" "RaffleType" DEFAULT 'BIWEEKLY';

-- Add the dayNumber column (used for daily raffles)
ALTER TABLE "raffles"
ADD COLUMN IF NOT EXISTS "dayNumber" INTEGER;

-- Add the prizeAmount column (prize amount in DEGEN)
ALTER TABLE "raffles"
ADD COLUMN IF NOT EXISTS "prizeAmount" INTEGER;

-- Add the winningTicketNumber column
ALTER TABLE "raffles"
ADD COLUMN IF NOT EXISTS "winningTicketNumber" INTEGER;

-- Add the selectionAlgorithm column
ALTER TABLE "raffles"
ADD COLUMN IF NOT EXISTS "selectionAlgorithm" TEXT;

-- Update existing records to have proper raffleType
-- Now that dayNumber exists, we can properly classify them
UPDATE "raffles"
SET "raffleType" = CASE
    WHEN "dayNumber" IS NOT NULL THEN 'DAILY'::"RaffleType"
    ELSE 'BIWEEKLY'::"RaffleType"
END
WHERE "raffleType" IS NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'raffles' AND column_name = 'raffleType';