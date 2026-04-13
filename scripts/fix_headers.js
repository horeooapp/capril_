const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/presse/page.tsx',
  'src/app/mentions-legales/page.tsx',
  'src/app/impact/ImpactClient.tsx',
  'src/app/faq/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/confidentialite/page.tsx',
  'src/app/cgu/page.tsx',
  'src/app/carriere/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/a-propos/page.tsx'
];

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add import Header if it doesn't exist
    if (!content.includes('import Header from "@/components/Header";')) {
        // Insert it after other imports
        content = content.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport Header from "@/components/Header";');
    }

    // Replace the nav block
    const navRegex = /\{\/\* HEADER \*\/\}\s*<nav id="navbar"[\s\S]*?<\/nav>/;
    content = content.replace(navRegex, '{/* HEADER */}\n      <Header />');

    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`${file} not found.`);
  }
});

// For ExpertiseClient
const expPath = path.join(__dirname, '..', 'src/components/public/ExpertiseClient.tsx');
if (fs.existsSync(expPath)) {
    let content = fs.readFileSync(expPath, 'utf8');
    if (!content.includes('import Header from "@/components/Header";')) {
        content = content.replace(/import Link from "next\/link";/, 'import Link from "next/link";\nimport Header from "@/components/Header";');
    }
    const headerRegex = /\{\/\* HEADER \*\/\}\s*<header className="bg-white\/80[\s\S]*?<\/header>/;
    content = content.replace(headerRegex, '{/* HEADER */}\n      <Header />');
    // Also wrap the whole div in landing-v2-wrapper so footer gets the CSS
    content = content.replace(/className="bg-white min-h-screen text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden"/, 'className="landing-v2-wrapper font-sans text-ink bg-cream min-h-screen overflow-x-hidden relative"');
    fs.writeFileSync(expPath, content);
    console.log(`Updated ExpertiseClient`);
}
