const fs = require('fs');
const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
const lines = schema.split('\n');
const idx = lines.findIndex(l => l.includes('model UserWalletConfig {'));
fs.writeFileSync('uwc.txt', lines.slice(idx, idx+15).join('\n'));
