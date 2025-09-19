-- Add missing tickets column to user_tickets table
-- This fixes the GitHub Action error for user_tickets.tickets

-- Add the tickets column
ALTER TABLE "user_tickets"
ADD COLUMN IF NOT EXISTS "tickets" INTEGER DEFAULT 0;

-- Copy data from ticketsCount to tickets for existing records
UPDATE "user_tickets"
SET "tickets" = "ticketsCount"
WHERE "tickets" = 0 AND "ticketsCount" > 0;

-- Create index for tickets column if it doesn't exist
CREATE INDEX IF NOT EXISTS "user_tickets_tickets_idx" ON "user_tickets"("tickets");

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_tickets' AND column_name IN ('tickets', 'ticketsCount');