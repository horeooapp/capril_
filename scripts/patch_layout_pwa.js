const fs = require('fs');
let code = fs.readFileSync('src/app/layout.tsx', 'utf8');
code = code.replace(/\r\n/g, '\n');

if (!code.includes('import PwaInstallPrompt')) {
    code = code.replace(
        'import CookieConsent from "@/components/CookieConsent";',
        'import CookieConsent from "@/components/CookieConsent";\nimport PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";'
    );
}

if (!code.includes('<PwaInstallPrompt />')) {
    code = code.replace(
        '<CookieConsent />',
        '<CookieConsent />\n        <PwaInstallPrompt />'
    );
}

fs.writeFileSync('src/app/layout.tsx', code, 'utf8');
console.log("Successfully added PwaInstallPrompt to layout.tsx!");

