require('dotenv/config');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL not set in environment');
  process.exit(2);
}

(async () => {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const res = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
    console.log('Databases:');
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
