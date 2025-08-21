-- Agregar tickets para el usuario actual (FID 546204)
-- Ejecutar cada comando por separado en Supabase SQL Editor

-- 1. Primero, verificar que hay una rifa activa
SELECT id, "weekPeriod", status FROM raffles WHERE status = 'ACTIVE';

-- 2. Agregar tickets al usuario 546204 (cambiar el ID de la rifa si es diferente)
INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "createdAt")
VALUES ('078adf95-4cc1-4569-9343-0337eb2ba356', '546204', 5, NOW())
ON CONFLICT ("raffleId", "userFid") 
DO UPDATE SET "ticketsCount" = user_tickets."ticketsCount" + 5;

-- 3. Actualizar totales de la rifa
UPDATE raffles SET 
    "totalTickets" = (SELECT COALESCE(SUM("ticketsCount"), 0) FROM user_tickets WHERE "raffleId" = '078adf95-4cc1-4569-9343-0337eb2ba356'),
    "totalParticipants" = (SELECT COUNT(DISTINCT "userFid") FROM user_tickets WHERE "raffleId" = '078adf95-4cc1-4569-9343-0337eb2ba356')
WHERE id = '078adf95-4cc1-4569-9343-0337eb2ba356';

-- 4. Verificar el resultado
SELECT "userFid", "ticketsCount" FROM user_tickets WHERE "raffleId" = '078adf95-4cc1-4569-9343-0337eb2ba356';