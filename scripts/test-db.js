const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("Connected to PROD DB");

    // 1. Check current type of 'statut' in fiscal_dossiers
    const colFetch = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'fiscal_dossiers' AND column_name = 'statut';
    `);
    console.log("Column type:", colFetch.rows[0]);

    // 2. Fetch distinct values of statut
    const valsFetch = await client.query(`SELECT DISTINCT statut FROM fiscal_dossiers`);
    console.log("Existing values in fiscal_dossiers for statut:", valsFetch.rows);

    // 3. Try to do the cast manually to see exact error:
    try {
      await client.query(`SELECT statut::text::"FiscalStatus" FROM fiscal_dossiers LIMIT 1`);
      console.log("CAST SUCCEEDED (if one row exists)");
    } catch (e) {
      console.error("CAST ERROR:", e.message);
    }

  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await client.end();
  }
}

run();
