import fs from 'fs';

function replaceInFile(filePath, replacements) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for(let r of replacements) {
      if (typeof r.search === 'string') {
        content = content.split(r.search).join(r.replacement);
      } else {
        content = content.replace(r.search, r.replacement);
      }
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (e) {
    console.error(`Error processing ${filePath}:`, e.message);
  }
}

const badgeReplacements = [
  { search: 'color="info"', replacement: 'color="blue"' },
  { search: "color='info'", replacement: "color='blue'" },
  { search: 'color="success"', replacement: 'color="green"' },
  { search: "color='success'", replacement: "color='green'" },
  { search: 'color="error"', replacement: 'color="red"' },
  { search: "color='error'", replacement: "color='red'" },
  { search: 'color="neutral"', replacement: 'color="gray"' },
  { search: "color='neutral'", replacement: "color='gray'" },
  { search: 'color="warning"', replacement: 'color="amber"' },
  { search: "color='warning'", replacement: "color='amber'" },
  { search: 'variant="info"', replacement: 'color="blue"' },
  { search: "variant='info'", replacement: "color='blue'" },
  { search: 'variant="success"', replacement: 'color="green"' },
  { search: "variant='success'", replacement: "color='green'" },
  { search: 'variant="error"', replacement: 'color="red"' },
  { search: "variant='error'", replacement: "color='red'" },
  { search: 'variant="neutral"', replacement: 'color="gray"' },
  { search: "variant='neutral'", replacement: "color='gray'" },
  { search: 'variant="warning"', replacement: 'color="amber"' },
  { search: "variant='warning'", replacement: "color='amber'" }
];

const badgeFiles = [
  'src/app/dashboard/(portal)/bdq/bdq-client.tsx',
  'src/app/dashboard/(portal)/fiscal/fiscal-client.tsx',
  'src/app/dashboard/(portal)/mandates/mandates-client.tsx',
  'src/app/dashboard/(portal)/payments/advances/page.tsx',
  'src/app/dashboard/(portal)/procurations/procurations-client.tsx',
  'src/app/dashboard/(portal)/wallet/cdc/page.tsx'
];

badgeFiles.forEach(f => replaceInFile(f, badgeReplacements));

const statReplacements = [
  { search: / title=/g, replacement: ' label=' },
  { search: / subtitle=/g, replacement: ' sub=' },
  // Remove icon gracefully
  { search: / icon=\{<[^>]+>\}/g, replacement: '' },
  // Handle multiline icon string matching cautiously if any
  { search: / icon=\{<[A-Za-z]+ size=\{[0-9]+\}( \/)?>\}/g, replacement: '' }
];
const statCardFiles = [
  'src/app/dashboard/(portal)/bdq/bdq-client.tsx',
  'src/app/dashboard/(portal)/charges/charges-client.tsx',
  'src/app/dashboard/(portal)/mandates/mandates-client.tsx'
];
statCardFiles.forEach(f => replaceInFile(f, statReplacements));

// Hand fixing trust-client.tsx
const trustClientPath = 'src/app/dashboard/(portal)/trust/trust-client.tsx';
try {
  let content = fs.readFileSync(trustClientPath, 'utf8');
  if (!content.includes('AlertTriangle')) {
    content = content.replace(/import { (.*?) } from "lucide-react"/, 'import { AlertTriangle, $1 } from "lucide-react"');
    if(content.includes('AlertTriangle, AlertTriangle')) content = content.replace('AlertTriangle, AlertTriangle', 'AlertTriangle');
    fs.writeFileSync(trustClientPath, content, 'utf8');
  }
} catch(e) {}
