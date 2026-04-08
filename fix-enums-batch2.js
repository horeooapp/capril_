const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// ==== ENUMS ====
schema = schema.replace(/PARTAGÉ_PROPRIO/g, 'PARTAGE_PROPRIO');
schema = schema.replace(/USAGE_DÉCLARÉ/g, 'USAGE_DECLARE');
schema = schema.replace(/RÉSOLU/g, 'RESOLU');
schema = schema.replace(/CONTESTÉ/g, 'CONTESTE');
schema = schema.replace(/CLÔTURÉ/g, 'CLOTURE');
schema = schema.replace(/PAYÉE/g, 'PAYEE');

if (!schema.includes('enum InspectionStatus')) {
  schema = schema.replace(/enum InspectionType \{/, 'enum InspectionStatus {\n  PLANIFIEE\n  EN_COURS\n  TERMINEE\n  ANNULEE\n}\n\nenum InspectionType {');
}

if (!schema.includes('enum CommissionStatut')) {
  schema += '\n\nenum CommissionStatut {\n  EN_ATTENTE\n  VALIDE\n  PAYE\n  ANNULE\n}\n';
}

if (!schema.match(/ReversalStatus \{\s*NONE/)) {
  schema = schema.replace(/enum ReversalStatus \{/, 'enum ReversalStatus {\n  NONE');
}

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Enums updated.');
