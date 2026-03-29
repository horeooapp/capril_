const fs = require('fs');
const data = JSON.parse(fs.readFileSync('package.json', 'utf8'));
data.prisma.seed = 'npx ts-node prisma/seed.ts';
fs.writeFileSync('package.json', JSON.stringify(data, null, 2));
console.log('Fixed package.json');
