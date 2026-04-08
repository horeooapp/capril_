const fs = require('fs');
const content = fs.readFileSync('prisma/schema.prisma', 'utf8');
const enums = [...content.matchAll(/enum (\w+) \{/g)].map(m => m[1]);
const unused = enums.filter(e => {
  const contentWithoutEnum = content.replace(new RegExp(`enum ${e} \\{[\\s\\S]*?\\}`, 'g'), '');
  const regex = new RegExp(`[:]?[ \\t]+${e}(\\?|\\[\\])?[ \\t\\n]`, 'g');
  return !regex.test(contentWithoutEnum);
});
fs.writeFileSync('unused_enums.json', JSON.stringify(unused, null, 2));
