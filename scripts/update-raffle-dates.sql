-- Script para actualizar las fechas de la rifa para testing
-- Actualiza la rifa para que esté activa AHORA

UPDATE raffles SET 
  "startDate" = NOW() - INTERVAL '1 hour',  -- Inició hace 1 hora
  "endDate" = NOW() + INTERVAL '7 days'     -- Termina en 7 días
WHERE id = '078adf95-4cc1-4569-9343-0337eb2ba356';

-- Verificar la actualización
SELECT 
  id,
  "weekPeriod",
  "startDate",
  "endDate",
  status,
  "totalTickets",
  "totalParticipants"
FROM raffles 
WHERE id = '078adf95-4cc1-4569-9343-0337eb2ba356';