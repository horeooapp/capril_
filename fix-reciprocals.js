const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Helper to replace inside a specific block
function addFieldToModel(schemaContent, modelName, fieldDef) {
  const modelRegex = new RegExp(`(model\\s+${modelName}\\s+\\{)([\\s\\S]*?)(\\})`, 'g');
  return schemaContent.replace(modelRegex, (match, start, block, end) => {
    if (!block.includes(fieldDef.split(' ')[0])) {
      return start + block + `  ${fieldDef}\n` + end;
    }
    return match;
  });
}

schema = addFieldToModel(schema, 'Property', 'mandateHistory MandateHistory[]');
schema = addFieldToModel(schema, 'Lease', 'colocPayments ColocPayment[]');
schema = addFieldToModel(schema, 'User', 'walletTransactions WalletTransaction[]');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Done adding reciprocal fields.');
