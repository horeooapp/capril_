const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace #1F4E79
    content = content.replace(/text-\[\#1F4E79\]/g, 'text-slate-800');
    content = content.replace(/bg-\[\#1F4E79\]/g, 'bg-slate-800');
    content = content.replace(/border-\[\#1F4E79\]/g, 'border-slate-800');
    content = content.replace(/from-\[\#1F4E79\]/g, 'from-slate-800');
    content = content.replace(/to-\[\#1F4E79\]/g, 'to-slate-800');
    content = content.replace(/fill-\[\#1F4E79\]/g, 'fill-slate-800');
    
    // Replace #C55A11
    content = content.replace(/text-\[\#C55A11\]/g, 'text-amber-600');
    content = content.replace(/bg-\[\#C55A11\]/g, 'bg-amber-600');
    content = content.replace(/border-\[\#C55A11\]/g, 'border-amber-600');

    if (content !== original) {
        fs.writeFileSync(file, content);
        changedCount++;
    }
});

console.log(`Updated colors in ${changedCount} files.`);
