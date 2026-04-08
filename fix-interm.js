const fs = require('fs');

const pathInterm = 'src/actions/intermediaire-actions.ts';
let text = fs.readFileSync(pathInterm, 'utf8');

// Add include.biens
text = text.replace(
  /proprietaire:\s*\{\s*select:\s*\{\s*firstName:\s*true,\s*lastName:\s*true,\s*id:\s*true\s*\}\s*\}/g,
  `proprietaire: {
                    select: { firstName: true, lastName: true, id: true }
                },
                biens: { select: { propertyId: true } }`
);

// Fix TS error in checkMandatAccess:
// biensConcernes: { has: propertyId }
text = text.replace(
  /biensConcernes:\s*\{\s*has:\s*propertyId\s*\}/g,
  `biens: { some: { propertyId } }`
);

// Fix usages of biensConcernes:
// const allPropertyIds = mandates.flatMap(m => (m as any).biensConcernes || [])
text = text.replace(
  /const allPropertyIds = mandates\.flatMap\(m => \(m as any\)\.biensConcernes \|\| \[\]\)/g,
  `const allPropertyIds = mandates.flatMap(m => (m as any).biens?.map((b: any) => b.propertyId) || [])`
);

// const mPropIds = (m as any).biensConcernes || []
text = text.replace(
  /const mPropIds = \(m as any\)\.biensConcernes \|\| \[\]/g,
  `const mPropIds = (m as any).biens?.map((b: any) => b.propertyId) || []`
);

fs.writeFileSync(pathInterm, text);
console.log('Fixed auth interm actions.');
