const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/app/presse/page.tsx',
  'src/app/mentions-legales/page.tsx',
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
    
    // Add import Footer if it doesn't exist
    if (!content.includes('import Footer from "@/components/Footer";')) {
        content = content.replace(/import Header from "@\/components\/Header";/, 'import Header from "@/components/Header";\nimport Footer from "@/components/Footer";');
    }

    // Replace the footer block. The hardcoded footers start with <footer className="bg-ink and end with </footer>
    // Let's match from <footer to </footer>
    const footerRegex = /<footer[\s\S]*?<\/footer>/g;
    
    // Verify it actually has a footer
    if (content.match(footerRegex)) {
        content = content.replace(footerRegex, '<Footer />');
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    } else {
        console.log(`No footer found in ${file}`);
    }

  } else {
    console.log(`${file} not found.`);
  }
});
