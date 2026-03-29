const fs = require('fs');
const path = 'prisma/schema.prisma';
let content = fs.readFileSync(path, 'utf8');
// Use a more flexible regex to handle potentially different line endings and spaces
const search = /paiementAvance\s+Boolean\s+@default\(true\)\s+@map\("paiement_avance"\)\s+\/\/ TRUE = payé d['’]avance \(standard CI\)\s+status/;
const replacement = 'paiementAvance     Boolean @default(true) @map("paiement_avance")    // TRUE = payé d\'avance (standard CI)\n\n  typeGestion    String? @default("directe") @map("type_gestion")\n  bailleurMasque Boolean @default(false) @map("bailleur_masque")\n\n  status';

if (search.test(content)) {
  content = content.replace(search, replacement);
  fs.writeFileSync(path, content);
  console.log('Success');
} else {
  console.log('Not found');
  // Log a snippet of the file to help debug if it fails
  const index = content.indexOf('paiement_avance');
  if (index !== -1) {
    console.log('Snippet:', content.substring(index - 50, index + 100));
  }
}
