const fs = require('fs');
const e = fs.readFileSync('.env.local', 'utf8');
const env = {};
e.split('\n').forEach(l => {
    l = l.trim();
    if (!l || l.startsWith('#')) return;
    const i = l.indexOf('=');
    if (i > 0) env[l.substring(0, i)] = l.substring(i + 1);
});
const { createClient } = require('./node_modules/@supabase/supabase-js');
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const { Client } = require('pg');

async function check() {
    const client = new Client({
        connectionString: "postgresql://postgres:[YOUR-PASSWORD]@db.eallydhjoozqehxylugm.supabase.co:5432/postgres".replace("[YOUR-PASSWORD]", "sbp_d4d29772574e3efb906b22e54771b16210d5184e")
    });
    await client.connect();
    try {
        const res = await client.query(`
            SELECT pg_get_constraintdef(oid) 
            FROM pg_constraint 
            WHERE conname = 'jobs_status_check';
        `);
        console.log(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
