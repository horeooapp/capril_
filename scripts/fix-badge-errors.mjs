import fs from 'fs';

function replaceExact(filePath, replacements) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;
        for (const [search, replace] of Object.entries(replacements)) {
            content = content.split(search).join(replace);
        }
        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Updated", filePath);
        }
    } catch (e) {
        // ignoring
    }
}

const badgeReplacements = {
    'variant="info"': 'color="blue"',
    "variant='info'": "color='blue'",
    'variant="success"': 'color="green"',
    "variant='success'": "color='green'",
    'variant="error"': 'color="red"',
    "variant='error'": "color='red'",
    'variant="neutral"': 'color="gray"',
    "variant='neutral'": "color='gray'",
    'variant="warning"': 'color="amber"',
    "variant='warning'": "color='amber'",
};

const badgeFiles = [
    'src/app/dashboard/(portal)/fiscal/fiscal-client.tsx',
    'src/app/dashboard/(portal)/payments/advances/page.tsx',
    'src/app/dashboard/(portal)/procurations/procurations-client.tsx',
    'src/app/dashboard/(portal)/wallet/cdc/page.tsx'
];

badgeFiles.forEach(f => replaceExact(f, badgeReplacements));

// Trust Client Target
const trustPath = 'src/app/dashboard/(portal)/trust/trust-client.tsx';
try {
    let tCont = fs.readFileSync(trustPath, 'utf8');
    if (!tCont.includes('AlertTriangle')) {
        tCont = tCont.replace('import { ShieldCheck', 'import { ShieldCheck, AlertTriangle');
        fs.writeFileSync(trustPath, tCont, 'utf8');
        console.log("Updated trust-client.tsx");
    }
} catch(e) {}
