const fs = require('fs');
const path = require('path');

let content = fs.readFileSync('d:/fracta/index.html', 'utf8');

// The "Dica de Estudo" section has blue-500/5, blue-50/70, blue-600, blue-700
content = content.replace(/from-blue-500\/5/g, 'from-amber-500/5');
content = content.replace(/bg-blue-50\/70/g, 'bg-amber-50/70');
content = content.replace(/text-blue-600/g, 'text-amber-600');
content = content.replace(/bg-blue-600/g, 'bg-amber-600');
content = content.replace(/hover:bg-blue-700/g, 'hover:bg-amber-700');

fs.writeFileSync('d:/fracta/index.html', content, 'utf8');
console.log('index.html blue to amber updated');
