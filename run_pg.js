const { Client } = require('pg');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
let dbUrl = '';
envContent.split('\n').forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
        dbUrl = line.substring(13).trim().replace(/"/g, '');
    }
});

const sqlPath = './supabase/migrations/008_fix_job_creation.sql';
const sql = fs.readFileSync(sqlPath, 'utf8');

async function runMigration() {
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to DB');
        await client.query(sql);
        console.log('Migration executed successfully');
    } catch (err) {
        console.error('Migration error:', err);
    } finally {
        await client.end();
    }
}

runMigration();
