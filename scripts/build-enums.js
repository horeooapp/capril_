const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const enumBlocks = schema.match(/enum\s+\w+\s+\{[\s\S]*?\}/g);
let createTypesSql = '-- CREATE ENUMS IF THEY DO NOT EXIST\n';

if (enumBlocks) {
  for (const block of enumBlocks) {
      const enumNameMatch = block.match(/enum\s+(\w+)\s+\{/);
      if (!enumNameMatch) continue;
      const enumName = enumNameMatch[1];
      
      const innerMatch = block.match(/\{([\s\S]*?)\}/)[1];
      const rawValues = innerMatch.split('\n')
          .map(l => l.trim())
          .filter(l => l && !l.startsWith('//'));
          
      const enumValues = rawValues.map(v => `'${v}'`).join(', ');
      
      createTypesSql += `
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}') THEN
        CREATE TYPE "${enumName}" AS ENUM (${enumValues});
    END IF;
END $$;
`;
  }
}

const currentSql = fs.readFileSync('scripts/fix-enums-pg.sql', 'utf8');
fs.writeFileSync('scripts/fix-enums-pg.sql', createTypesSql + '\n\n' + currentSql);
console.log('Successfully injected CREATE TYPE blocks!');
