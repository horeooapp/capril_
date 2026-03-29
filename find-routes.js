const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
        if (file.includes('[')) results.push(file);
        results = results.concat(walkDir(file));
    }
  });
  return results;
}

const res = walkDir(path.join(process.cwd(), 'src', 'app'));
console.log(res);
