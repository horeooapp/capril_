const fs = require('fs');

const errorText = fs.readFileSync('ts_errors_utf8.txt', 'utf8');
const errors = errorText.split('\n');

const fileLinesToFix = {};

errors.forEach(line => {
  const match = line.match(/^([a-zA-Z0-9_\-\.\/\\]+\.tsx?)\((\d+),\d+\): error TS(\d+): (.*)/);
  if (match) {
    const file = match[1];
    const lineNumber = parseInt(match[2], 10) - 1; // 0-indexed
    const message = match[4];

    if (!fileLinesToFix[file]) {
      fileLinesToFix[file] = {};
    }
    if (!fileLinesToFix[file][lineNumber]) {
      fileLinesToFix[file][lineNumber] = [];
    }
    fileLinesToFix[file][lineNumber].push({ message });
  }
});

for (const file in fileLinesToFix) {
  if (!fs.existsSync(file)) continue;
  let lines = fs.readFileSync(file, 'utf8').split('\n');
  let modified = false;

  for (const lineNumStr in fileLinesToFix[file]) {
    const lineNum = parseInt(lineNumStr, 10);
    const lineErrors = fileLinesToFix[file][lineNum];
    let lineContent = lines[lineNum];
    
    lineErrors.forEach(err => {
      if (err.message.includes("Property 'firstName' does not exist") || err.message.includes("Property 'lastName' does not exist")) {
         lineContent = lineContent.replace(/\(([a-zA-Z0-9_\.\!\$]+)\??\.firstName \? \1\??\.firstName \+ " " : ""\) \+ \(\1\??\.lastName \|\| ""\)/g, '$1.fullName');
      }
    });

    if (lines[lineNum] !== lineContent) {
      lines[lineNum] = lineContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join('\n'));
    console.log(`Fixed ${file}`);
  }
}
