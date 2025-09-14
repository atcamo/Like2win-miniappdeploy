// Crear archivos de datos locales para que el sistema funcione
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');

async function createLocalDataFiles() {
    console.log('📁 CREANDO ARCHIVOS DE DATOS LOCALES');
    console.log('='.repeat(50));

    const dataPath = path.join(process.cwd(), 'data');
    const userTicketsFile = path.join(dataPath, 'local-user-tickets.json');
    const raffleDataFile = path.join(dataPath, 'local-raffle-data.json');

    try {
        // Crear directorio data si no existe
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
            console.log('✅ Directorio data/ creado');
        }

        // Crear archivo de tickets de usuarios
        const userTicketsData = {
            "432789": {
                "username": "atcamo",
                "tickets": 7,
                "lastActivity": "2025-08-29T03:52:58.223Z",
                "engagements": ["like", "like", "like", "recast", "like", "like", "like"]
            },
            "245969": {
                "username": "zahoorahmed",
                "tickets": 4,
                "lastActivity": "2025-08-29T02:15:30.123Z",
                "engagements": ["like", "recast", "like", "like"]
            },
            "546204": {
                "username": "beenouns",
                "tickets": 3,
                "lastActivity": "2025-08-29T01:30:45.456Z",
                "engagements": ["like", "like", "recast"]
            }
        };

        fs.writeFileSync(userTicketsFile, JSON.stringify(userTicketsData, null, 2));
        console.log('✅ Archivo local-user-tickets.json creado');

        // Crear archivo de datos de raffle
        const raffleData = {
            "id": "local-raffle-2025",
            "weekPeriod": "Week 34-37 2025 (Launch Raffle)",
            "startDate": "2025-08-18T00:00:00.000Z",
            "endDate": "2025-09-30T23:59:59.000Z", // Extendido para que sea activo
            "totalTickets": 20,
            "totalParticipants": 8,
            "status": "ACTIVE",
            "lastUpdated": "2025-08-29T03:52:58.223Z"
        };

        fs.writeFileSync(raffleDataFile, JSON.stringify(raffleData, null, 2));
        console.log('✅ Archivo local-raffle-data.json creado');

        console.log('\n🎯 ARCHIVOS CREADOS EXITOSAMENTE:');
        console.log(`   ${userTicketsFile}`);
        console.log(`   ${raffleDataFile}`);

        console.log('\n📊 DATOS INICIALES:');
        console.log(`   Participantes: ${Object.keys(userTicketsData).length}`);
        console.log(`   Total tickets: ${raffleData.totalTickets}`);
        console.log(`   Raffle activo hasta: ${raffleData.endDate}`);

        // Test de lectura
        console.log('\n🧪 PROBANDO LECTURA DE ARCHIVOS...');
        const testUserData = JSON.parse(fs.readFileSync(userTicketsFile, 'utf8'));
        const testRaffleData = JSON.parse(fs.readFileSync(raffleDataFile, 'utf8'));

        console.log('✅ Archivos se pueden leer correctamente');
        console.log(`   Usuarios en archivo: ${Object.keys(testUserData).length}`);
        console.log(`   Raffle status: ${testRaffleData.status}`);

    } catch (error) {
        console.error('❌ Error creando archivos:', error);
    }
}

createLocalDataFiles();