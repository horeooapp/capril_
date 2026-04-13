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
  'src/app/a-propos/page.tsx',
  'src/app/faq/page.tsx'
];

targetFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Change <h2 className="text-lg font-black uppercase tracking-tight text-ink"> or similar
    // to <h3 className="...">
    content = content.replace(/<h2 (className="[^"]*text-xl[^"]*"|className="[^"]*text-lg[^"]*")/g, '<h3 $1');
    content = content.replace(/<\/h2>/g, '</h3>');
    
    // Some lines might literally just be <h2 className="...">
    // Let's do a wider replace for all <h2 className=... inside the grid-cols loops
    content = content.replace(/<h2 /g, '<h3 ');
    
    // Also fix the grid layout overlap. If the text overlaps, it's better to give it more space, e.g. col-span-1 to col-span-4 on mobile!
    // Tailwind classes: grid-cols-1 md:grid-cols-4 
    // They already have md:col-span-1 and md:col-span-3. On desktop this means 25% / 75%. If the text is large it might overlap.
    // Changing to h3 avoids the global CSS font-size clamp.
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
