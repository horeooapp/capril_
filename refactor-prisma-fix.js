const fs = require('fs');
const path = require('path');

const prismaFile = path.resolve('prisma/schema.prisma');
let content = fs.readFileSync(prismaFile, 'utf8');

// 1. Enlever les \n textuels
content = content.replace(/\\n/g, '');

// 2. Property: enlever la relation groupe
content = content.replace(/.*groupe\s+Property\?.*[\r\n]+/g, '');

// 3. Double @default
content = content.replace(/(@default\([^)]+\))\s+@default\([^)]+\)/g, '$1');

// Wait... there was also `@default("AWAITING_PAYMENT")` vs `@default(PENDING)`. The first capture group keeps the first enum default I added. Good.

fs.writeFileSync(prismaFile, content, 'utf8');
console.log("Fix appliqué.");
