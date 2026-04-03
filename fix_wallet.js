const fs = require('fs');

const files = [
    "src/actions/dashboard.actions.ts",
    "src/actions/receipts.ts",
    "src/actions/wallet-actions.ts",
    "src/actions/wallet.actions.ts",
    "src/app/api/v1/agences/me/route.ts",
    "src/app/api/v1/baux/generate/route.ts",
    "src/app/api/v1/locataires/me/route.ts",
    "src/app/api/v1/proprietaires/me/confidentiel/route.ts",
    "src/app/api/v1/proprietaires/me/route.ts",
    "src/app/api/v1/quittances/generate/route.ts",
    "src/app/api/v1/wallet/stats/route.ts",
    "src/components/dashboard/DashboardBailleur.tsx",
    "src/lib/wallet/calculator.ts",
    "src/lib/wallet/transactions.ts",
    "src/lib/wallet/triggers.ts"
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  let orig = content;
  
  // Fix double question marks caused by previous destructive sed
  content = content.replace(/\?\?\.walletBalance/g, '?.walletConfig?.walletBalance');
  content = content.replace(/\?\?\.walletSeuil/g, '?.walletConfig?.walletSeuil');
  content = content.replace(/\?\?\.wallet/g, '?.walletConfig?.wallet');
  
  // Fix nested includes
  content = content.replace(/select:\s*{\s+walletConfig:\s*{\s*select:\s*{\s*walletBalance:\s*true\s*}\s*}\s*,\s*walletSeuilAlerte:\s*true\s*,\s*firstName:\s*true\s*,\s*lastName:\s*true\s*}/g, 'select: { walletConfig: { select: { walletBalance: true, walletSeuilAlerte: true } }, firstName: true, lastName: true }');
  
  if (content !== orig) {
     fs.writeFileSync(file, content);
     console.log("Fixed " + file);
  }
}
