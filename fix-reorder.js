const fs = require('fs');

let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');
const targetModels = ['Receipt', 'ReliabilityScore', 'IclEvent', 'MarketData', 'MigrationStaging', 'PropertyImage', 'BdqSmsLog'];

targetModels.forEach(modelName => {
  let startIndex = -1;
  let endIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp(`^model\\s+${modelName}\\s+\\{`))) startIndex = i;
    else if (startIndex !== -1 && lines[i].match(/^\}/)) {
      endIndex = i;
      break;
    }
  }

  if (startIndex === -1 || endIndex === -1) return;

  const preBlock = lines.slice(0, startIndex + 1);
  const blockLines = lines.slice(startIndex + 1, endIndex);
  const postBlock = lines.slice(endIndex);

  let idLine = '';
  let createUpdateLines = [];
  let otherLines = [];

  blockLines.forEach(line => {
    if (line.match(/^\s+id\s+/)) {
      idLine = line;
    } else if (line.match(/^\s+(createdAt|updatedAt)\s+DateTime/)) {
      createUpdateLines.push(line);
    } else {
      otherLines.push(line);
    }
  });

  // Reorder
  const newBlockLines = [];
  if (idLine) newBlockLines.push(idLine);
  newBlockLines.push(...otherLines);
  
  // Find where @@ mapping starts to place createdAt/updatedAt just before it
  let insertMapIndex = newBlockLines.length;
  for (let i = 0; i < newBlockLines.length; i++) {
    if (newBlockLines[i].match(/^\s+@@/)) {
      insertMapIndex = i;
      break;
    }
  }

  // Ensure there's a blank line before insert if needed
  if (insertMapIndex > 0 && newBlockLines[insertMapIndex - 1].trim() !== '') {
    newBlockLines.splice(insertMapIndex, 0, '');
    insertMapIndex++;
  }

  newBlockLines.splice(insertMapIndex, 0, ...createUpdateLines);

  lines = preBlock.concat(newBlockLines).concat(postBlock);
});

fs.writeFileSync('prisma/schema.prisma', lines.join('\n'));
console.log('Finished reordering models.');
