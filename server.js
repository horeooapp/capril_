// Robust server.js for Standalone production mode (Hostinger/LWS)
const path = require('path');
const fs = require('fs');

process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || 3000;

console.log(`[QAPRIL] Booting production server...`);

// Path candidates for the internal Next.js server
const paths = [
    path.join(__dirname, '.next', 'standalone', 'server.js'),
    path.join(__dirname, 'standalone', 'server.js'), // If only .next was moved
];

let found = false;
for (const p of paths) {
    if (fs.existsSync(p)) {
        console.log(`[QAPRIL] Found internal server at: ${p}`);
        require(p);
        found = true;
        break;
    }
}

if (!found) {
    console.error(`[QAPRIL ERROR] Could not find the internal Next.js server.`);
    console.error(`Check that you have uploaded the '.next/standalone' folder.`);
    process.exit(1);
}
