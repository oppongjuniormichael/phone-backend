require('dotenv/config');
const { Client } = require('pg');

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASS || process.env.PASSWORD || process.env.DB_PASSWORD;
const database = process.env.DB_NAME || 'postgres';

(async () => {
  const client = new Client({ host, port, user, password, database });
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('Connected. Databases:');
    res.rows.forEach(r => console.log('-', r.datname));
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err.message);
    if (err.code) console.error('Postgres error code:', err.code);
    if (err.detail) console.error('Detail:', err.detail);
    process.exit(1);
  }
})();
