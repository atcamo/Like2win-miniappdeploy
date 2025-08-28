-- CHECK PRODUCTION STATUS
-- Run this in Supabase to verify current data

-- Check active raffles
SELECT 
  'Active Raffles' as table_name,
  count(*) as count,
  json_agg(
    json_build_object(
      'id', id,
      'weekPeriod', "weekPeriod",
      'status', status,
      'totalParticipants', "totalParticipants", 
      'totalTickets', "totalTickets",
      'totalPool', "totalPool"
    )
  ) as data
FROM raffles 
WHERE status = 'ACTIVE'

UNION ALL

-- Check user tickets
SELECT 
  'User Tickets' as table_name,
  count(*) as count,
  json_agg(
    json_build_object(
      'userFid', "userFid",
      'raffleId', "raffleId",
      'ticketsCount', "ticketsCount"
    )
  ) as data
FROM user_tickets

UNION ALL

-- Check engagement log
SELECT 
  'Engagement Logs' as table_name,
  count(*) as count,
  case 
    when count(*) > 0 then json_agg(
      json_build_object(
        'userFid', "userFid",
        'actionType', "actionType",
        'createdAt', "createdAt"
      )
    )
    else '[]'::json
  end as data
FROM engagement_log
ORDER BY table_name;