-- Script para agregar datos de prueba al sistema Like2Win
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar usuario de prueba
INSERT INTO users (
  fid, 
  username, 
  display_name
) VALUES (
  '12345',
  'testuser',
  'Test User'
) ON CONFLICT (fid) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name;

-- 2. Agregar tickets para el usuario de prueba
INSERT INTO user_tickets (
  "raffleId",
  "userFid", 
  "ticketsCount",
  "createdAt"
) VALUES (
  '078adf95-4cc1-4569-9343-0337eb2ba356',  -- ID del raffle activo
  '12345',
  5,  -- 5 tickets de prueba
  now()
) ON CONFLICT ("raffleId", "userFid") DO UPDATE SET
  "ticketsCount" = EXCLUDED."ticketsCount";

-- 3. Agregar más usuarios de prueba para el leaderboard
INSERT INTO users (fid, username, display_name) VALUES 
  ('11111', 'alice', 'Alice'),
  ('22222', 'bob', 'Bob'),
  ('33333', 'charlie', 'Charlie')
ON CONFLICT (fid) DO NOTHING;

-- 4. Agregar tickets para otros usuarios
INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount", "createdAt") VALUES 
  ('078adf95-4cc1-4569-9343-0337eb2ba356', '11111', 8, now()),
  ('078adf95-4cc1-4569-9343-0337eb2ba356', '22222', 3, now()),
  ('078adf95-4cc1-4569-9343-0337eb2ba356', '33333', 12, now())
ON CONFLICT ("raffleId", "userFid") DO UPDATE SET
  "ticketsCount" = EXCLUDED."ticketsCount";

-- 5. Actualizar totales del raffle
UPDATE raffles SET 
  "totalParticipants" = 4,
  "totalTickets" = 28  -- 5 + 8 + 3 + 12
WHERE id = '078adf95-4cc1-4569-9343-0337eb2ba356';

-- 6. Verificar resultados
SELECT 'Raffle Info' as type, id, "weekPeriod", "totalParticipants", "totalTickets" 
FROM raffles 
WHERE id = '078adf95-4cc1-4569-9343-0337eb2ba356'

UNION ALL

SELECT 'User Tickets' as type, "userFid" as id, 
       users.username as "weekPeriod", 
       "ticketsCount" as "totalParticipants", 
       "ticketsCount" as "totalTickets"
FROM user_tickets 
JOIN users ON users.fid = user_tickets."userFid"
WHERE "raffleId" = '078adf95-4cc1-4569-9343-0337eb2ba356'
ORDER BY type, "totalTickets" DESC;