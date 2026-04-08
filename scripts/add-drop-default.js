const fs = require('fs');
let sql = fs.readFileSync('scripts/fix-enums-pg.sql', 'utf8');

// Match `ALTER TABLE X ALTER COLUMN Y TYPE Z USING ...;`
sql = sql.replace(/ALTER TABLE (".*?") ALTER COLUMN (".*?") TYPE/g, 
  'ALTER TABLE $1 ALTER COLUMN $2 DROP DEFAULT;\n    ALTER TABLE $1 ALTER COLUMN $2 TYPE');

fs.writeFileSync('scripts/fix-enums-pg.sql', sql);
console.log('Added DROP DEFAULT!');
