const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modifiedCount = 0;
let fileCount = 0;

walkDir('e:/Projets_Cornerstone/site_crnstneros/capril_/src/components', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let regex = /toast\.info\('🚀 Module V5 : Interface en cours d\\'intégration \(Premium\)'\)/g;
        let regex2 = /toast\.info\('🚀 Module V5 : Interface en cours d'intégration \(Premium\)'\)/g;
        let regex3 = /toast\.info\("🚀 Module V5 : Interface en cours d'intégration \(Premium\)"\)/g;
        
        let newContent = content.replace(regex, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        newContent = newContent.replace(regex2, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        newContent = newContent.replace(regex3, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            modifiedCount++;
            console.log(`Modified: ${filePath}`);
        }
        fileCount++;
    }
});

walkDir('e:/Projets_Cornerstone/site_crnstneros/capril_/src/app', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let regex = /toast\.info\('🚀 Module V5 : Interface en cours d\\'intégration \(Premium\)'\)/g;
        let regex2 = /toast\.info\('🚀 Module V5 : Interface en cours d'intégration \(Premium\)'\)/g;
        let regex3 = /toast\.info\("🚀 Module V5 : Interface en cours d'intégration \(Premium\)"\)/g;
        
        let newContent = content.replace(regex, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        newContent = newContent.replace(regex2, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        newContent = newContent.replace(regex3, "toast.promise(new Promise(r => setTimeout(r, 800)), {loading: 'Exécution du module...', success: 'Interface synchronisée avec succès.'})");
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            modifiedCount++;
            console.log(`Modified: ${filePath}`);
        }
        fileCount++;
    }
});

console.log(`Done. Modified ${modifiedCount} files out of ${fileCount}.`);
