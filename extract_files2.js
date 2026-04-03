const fs = require('fs');
const errorText = fs.readFileSync('ts_errors2_utf8.txt', 'utf8');
const errors = errorText.split('\n');
const filesToFix = new Set();
errors.forEach(line => {
    const match = line.match(/^([a-zA-Z0-9_\-\.\/\\]+\.tsx?)\(\d+,\d+\): error TS/);
    if (match) {
        filesToFix.add(match[1]);
    }
});
console.log("Number of files with errors: " + filesToFix.size);
Array.from(filesToFix).forEach(f => console.log(f));
