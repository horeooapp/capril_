const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
console.log(`Ouverture de la base de données : ${dbPath}`);

const db = new Database(dbPath);

try {
  console.log("Exécution de ETAPE 11A : ALTER TABLE tickets_maintenance ADD COLUMN proprio_vu_at DATETIME");
  // Try to add the column. It will fail if it already exists, which is acceptable.
  db.exec(`ALTER TABLE tickets_maintenance ADD COLUMN proprio_vu_at DATETIME;`);
  console.log("✅ Colonne proprio_vu_at ajoutée avec succès.");
} catch (error) {
  if (error.message.includes("duplicate column name")) {
    console.log("ℹ️ La colonne proprio_vu_at existe déjà. Poursuite sans erreur.");
  } else {
    console.error("❌ Erreur lors de l'ajout de la colonne :", error.message);
    process.exit(1);
  }
}

// Vérification
const columns = db.pragma("table_info(tickets_maintenance)");
const hasProprioVuAt = columns.some(c => c.name === "proprio_vu_at");
console.log(`Vérification : proprio_vu_at présent ? ${hasProprioVuAt ? "OUI" : "NON"}`);

db.close();
console.log("Terminé.");
