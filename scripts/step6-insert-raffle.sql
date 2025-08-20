-- Step 6: Insert first active raffle
INSERT INTO raffles (
  week_period,
  start_date,
  end_date,
  total_pool,
  founder_contribution,
  status,
  created_at
) VALUES (
  '2025-W03',
  '2025-01-13 00:00:00'::timestamp,
  '2025-01-26 23:59:59'::timestamp,
  50000,
  50000,
  'ACTIVE',
  now()
) ON CONFLICT (week_period) DO NOTHING;