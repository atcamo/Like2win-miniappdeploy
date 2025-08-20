-- Crear el primer sorteo activo para Like2Win
-- Ejecutar en Supabase SQL Editor

INSERT INTO raffles (
  id,
  week_period,
  start_date,
  end_date,
  total_pool,
  founder_contribution,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  '2025-W03', -- Semana 3 de 2025
  '2025-01-13 00:00:00'::timestamp,
  '2025-01-26 23:59:59'::timestamp,
  50000, -- 50,000 $DEGEN para empezar
  50000, -- Contribución inicial del founder
  'ACTIVE',
  now()
);

-- Verificar que se creó correctamente
SELECT 
  id,
  week_period,
  start_date,
  end_date,
  status,
  total_pool,
  total_participants,
  total_tickets
FROM raffles 
WHERE status = 'ACTIVE'
ORDER BY created_at DESC;