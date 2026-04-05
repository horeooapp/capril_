const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const p = new PrismaClient();
p.user.findFirst().then(u => {
  fs.writeFileSync('user-keys.txt', Object.keys(u).join('\n'));
}).catch(console.error).finally(() => p.$disconnect());
