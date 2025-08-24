const { Pool } = require('pg');

async function insertTestData() {
  console.log('🧪 Insertando datos de prueba para Like2Win...');

  // Database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1
  });

  try {
    // 1. Create active raffle if doesn't exist
    console.log('📅 Verificando sorteo activo...');
    const raffleCheck = await pool.query(`
      SELECT id FROM raffles WHERE status = 'ACTIVE'
    `);

    let raffleId;
    if (raffleCheck.rows.length === 0) {
      console.log('🆕 Creando nuevo sorteo activo...');
      const raffleResult = await pool.query(`
        INSERT INTO raffles (
          "weekPeriod", "startDate", "endDate", status, 
          "totalTickets", "totalParticipants"
        ) VALUES (
          '2025-W04', $1, $2, 'ACTIVE', 0, 0
        ) RETURNING id
      `, [
        new Date('2025-01-20'),
        new Date('2025-02-03')
      ]);
      raffleId = raffleResult.rows[0].id;
      console.log('✅ Sorteo creado:', raffleId);
    } else {
      raffleId = raffleCheck.rows[0].id;
      console.log('✅ Usando sorteo existente:', raffleId);
    }

    // 2. Insert test participants with varying ticket counts
    const testUsers = [
      { fid: 432789, tickets: 25 }, // Admin user (you)
      { fid: 123456, tickets: 18 },
      { fid: 234567, tickets: 12 },
      { fid: 345678, tickets: 8 },
      { fid: 456789, tickets: 5 },
      { fid: 567890, tickets: 3 },
      { fid: 678901, tickets: 2 },
      { fid: 789012, tickets: 1 },
      { fid: 890123, tickets: 1 },
      { fid: 901234, tickets: 1 }
    ];

    console.log('👥 Insertando participantes de prueba...');
    for (const user of testUsers) {
      try {
        await pool.query(`
          INSERT INTO user_tickets ("raffleId", "userFid", "ticketsCount")
          VALUES ($1, $2, $3)
          ON CONFLICT ("raffleId", "userFid") 
          DO UPDATE SET "ticketsCount" = $3
        `, [raffleId, user.fid, user.tickets]);
        
        console.log(`  ✅ Usuario ${user.fid}: ${user.tickets} tickets`);
      } catch (error) {
        console.log(`  ⚠️ Error insertando usuario ${user.fid}:`, error.message);
      }
    }

    // 3. Update raffle totals
    console.log('📊 Actualizando totales del sorteo...');
    const totalTickets = testUsers.reduce((sum, user) => sum + user.tickets, 0);
    const totalParticipants = testUsers.length;

    await pool.query(`
      UPDATE raffles SET 
        "totalTickets" = $1,
        "totalParticipants" = $2
      WHERE id = $3
    `, [totalTickets, totalParticipants, raffleId]);

    console.log('✅ Datos de prueba insertados exitosamente!');
    console.log(`📈 Total: ${totalParticipants} participantes, ${totalTickets} tickets`);
    console.log('🎯 El leaderboard ahora debería mostrar estos usuarios.');

  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
  } finally {
    await pool.end();
  }
}

// Solo ejecutar si se llama directamente
if (require.main === module) {
  insertTestData();
}

module.exports = { insertTestData };