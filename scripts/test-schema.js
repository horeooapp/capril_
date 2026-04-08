const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'fiscal_dossiers'");
  console.log("SCHEMA FISCAL DOSSIERS:");
  res.rows.forEach(r => console.log(r));
  await client.end();
}
run();
