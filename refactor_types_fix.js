const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (/\.(ts|tsx)$/.test(fullPath)) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const allFiles = getFiles(srcDir);
let changedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Prisma Select objects
  content = content.replace(/\bfullName\s*:\s*true/g, 'firstName: true, lastName: true');
  content = content.replace(/\bfullName\s*:\s*false/g, 'firstName: false, lastName: false');
  content = content.replace(/\bname\s*:\s*true/g, 'firstName: true, lastName: true'); // some used "name: true" on user Object

  // 2. Property accesses
  // Replace object.fullName where object is a simple identifier OR chained like p.owner
  content = content.replace(/([a-zA-Z0-9_.]+)\.fullName/g, '($1.firstName ? $1.firstName + " " : "") + ($1.lastName || "")');
  content = content.replace(/([a-zA-Z0-9_.]+)\?\.fullName/g, '($1?.firstName ? $1.firstName + " " : "") + ($1?.lastName || "")');
  
  // Replace references to user.name
  content = content.replace(/([a-zA-Z0-9_.]+)\.name\b/g, (match, p1) => {
     if (p1.toLowerCase().includes('user') || p1.toLowerCase().includes('tenant') || p1.toLowerCase().includes('owner') || p1.toLowerCase().includes('landlord') || p1.toLowerCase().includes('agent')) {
        return `(${p1}.firstName ? ${p1}.firstName + " " : "") + (${p1}.lastName || "")`;
     }
     return match;
  });

  // 3. Wallet Selects & Access
  content = content.replace(/\bwalletBalance\s*:\s*true/g, 'walletConfig: { select: { walletBalance: true } }');
  content = content.replace(/([a-zA-Z0-9_.]+)\.walletBalance/g, '($1.walletConfig?.walletBalance || 0)');
  content = content.replace(/([a-zA-Z0-9_.]+)\?\.walletBalance/g, '($1?.walletConfig?.walletBalance || 0)');
  
  content = content.replace(/\blandlordCode\s*:\s*true/g, 'walletConfig: { select: { landlordCode: true } }');
  content = content.replace(/([a-zA-Z0-9_.]+)\.landlordCode/g, '$1.walletConfig?.landlordCode');
  content = content.replace(/([a-zA-Z0-9_.]+)\?\.landlordCode/g, '$1?.walletConfig?.landlordCode');

  // 4. Diaspora Selects & Access
  content = content.replace(/([a-zA-Z0-9_.]+)\.diasporaDevise/g, '($1.diasporaProfile?.diasporaDevise || "FCFA")');
  content = content.replace(/([a-zA-Z0-9_.]+)\.diasporaStripeId/g, '$1.diasporaProfile?.diasporaStripeId');
  content = content.replace(/([a-zA-Z0-9_.]+)\.paysResidence/g, '$1.diasporaProfile?.paysResidence');
  content = content.replace(/([a-zA-Z0-9_.]+)\.fuseauHoraire/g, '($1.diasporaProfile?.fuseauHoraire || "Africa/Abidjan")');

  // 5. Fraud Selects & Access
  content = content.replace(/([a-zA-Z0-9_.]+)\.fraudScore/g, '($1.fraudProfile?.fraudScore || 0)');
  content = content.replace(/([a-zA-Z0-9_.]+)\.fraudFlags/g, '$1.fraudProfile?.fraudFlags');
  content = content.replace(/([a-zA-Z0-9_.]+)\.deviceFingerprint/g, '$1.fraudProfile?.deviceFingerprint');

  // 6. Wallet configs access
  content = content.replace(/([a-zA-Z0-9_.]+)\.walletOperateurPrefere/g, '$1.walletConfig?.walletOperateurPrefere');
  content = content.replace(/([a-zA-Z0-9_.]+)\.walletCanalAlertePref/g, '$1.walletConfig?.walletCanalAlertePref');
  content = content.replace(/([a-zA-Z0-9_.]+)\.walletSeuilAlerte/g, '$1.walletConfig?.walletSeuilAlerte');

  // 7. Small typo "Property 'lease' does not exist -> 'leaseId'" inside object payloads
  // We'll leave this to manual/TypeScript for precision, unless we know exactly.
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
}

console.log(`Refactored ${changedCount} files successfully.`);
