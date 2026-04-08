const fs = require('fs');

function revertBadReplaces(path) {
  if (!fs.existsSync(path)) return;
  let text = fs.readFileSync(path, 'utf8');
  
  // My bad regex was:
  // t = t.replace(/biensConcernes:\s*([a-zA-Z0-9_\.\[\]]+)(\s*[,}])/g, 'biens: { create: $1?.map((id: string) => ({ propertyId: id })) || [] }$2');
  
  // So `string[]` in the interface signature became:
  // `biens: { create: string[]?.map((id: string) => ({ propertyId: id })) || [] },`
  text = text.replace(/biens:\s*\{\s*create:\s*([a-zA-Z0-9_\.\[\]]+)\?\.\s*map\s*\(\(.*?\)\s*=>\s*\(\{\s*propertyId:\s*.*?\}\)\)\s*\|\|\s*\[\]\s*\}/g, 'biensConcernes: $1');

  // Let's replace any other corrupted bits
  text = text.replace(/biensConcernes:\s*([a-zA-Z0-9_\.\[\]]+)/g, 'biensConcernes: $1 as any');

  fs.writeFileSync(path, text);
}

['src/actions/diaspora-actions.ts', 'src/actions/intermediaire-actions.ts', 'src/actions/mandates-gestion.ts'].forEach(revertBadReplaces);
console.log('Restored broken typescript bits.');
