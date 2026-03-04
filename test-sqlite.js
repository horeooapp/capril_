const sqlite3 = require('sqlite3').verbose();
const path = require('path');

function checkDb(file) {
    return new Promise((resolve) => {
        let db = new sqlite3.Database(file, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.error(`Error opening ${file}:`, err.message);
                resolve(false);
                return;
            }
        });

        db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, rows) => {
            if (err) {
                console.error(`Error reading ${file}:`, err.message);
            } else {
                console.log(`\nTables in ${file} (${rows.length} total):`);
                let tableNames = rows.map(r => r.name);
                console.log(tableNames.join(", "));
                if (tableNames.includes('User')) {
                    console.log("-> ✅ User table found in this database.");
                } else {
                    console.log("-> ❌ User table NOT FOUND.");
                }
            }
            db.close();
            resolve(true);
        });
    });
}

async function main() {
    await checkDb(path.join(__dirname, 'dev.db'));
    await checkDb(path.join(__dirname, 'prisma', 'dev.db'));
}

main();
