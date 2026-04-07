const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('eslint-output.json', 'utf8'));
  const issues = {};
  let totalErrors = 0;
  
  data.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
      file.messages.forEach(msg => {
        // filter out react-hooks/exhaustive-deps, any un-useful warnings
        if (msg.severity === 2 || (msg.severity === 1 && msg.ruleId === '@typescript-eslint/no-unused-vars')) {
             if (msg.severity === 2) totalErrors++;
             const key = msg.ruleId || 'syntax-error';
             if (!issues[key]) issues[key] = [];
             issues[key].push({
               file: file.filePath.replace(process.cwd(), ''),
               line: msg.line,
               message: msg.message
             });
        }
      });
    }
  });

  console.log(`Total Errors (severity 2): ${totalErrors}`);
  
  for (const [rule, occurrences] of Object.entries(issues)) {
    console.log(`\n--- Rule: ${rule} (${occurrences.length} instances) ---`);
    occurrences.slice(0, 5).forEach(occ => {
      console.log(`  ${occ.file}:${occ.line} -> ${occ.message}`);
    });
    if (occurrences.length > 5) console.log(`  ... and ${occurrences.length - 5} more`);
  }
} catch (e) {
  console.error("Error parsing eslint-output.json", e);
}
