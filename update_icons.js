const fs = require('fs');

// Fix Crown
const conquistasFile = 'd:/fracta/templates/conquistas.html';
if (fs.existsSync(conquistasFile)) {
    let content = fs.readFileSync(conquistasFile, 'utf8');
    
    // The "Rei das Frações" section currently has an SVG. Let's find "Rei das Frações" and replace the <svg> before it.
    const crownSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 20h18v2H3v-2zm18-11.5l-4.5 4.5L12 7l-4.5 6L3 8.5V18h18V8.5z" /></svg>`;
    
    // We can use a regex to match the <svg>...</svg> inside the div that contains "Rei das Frações"
    content = content.replace(/(<div class="text-4xl mb-3">)(<svg[\s\S]*?<\/svg>)(<\/div>\s*<span class="text-xs font-medium text-gray-400">Rei das Frações<\/span>)/g, `$1${crownSVG}$3`);
    
    fs.writeFileSync(conquistasFile, content, 'utf8');
}

// Remove Fire from 7 Dias in progresso.html
const progressoFile = 'd:/fracta/templates/progresso.html';
if (fs.existsSync(progressoFile)) {
    let content = fs.readFileSync(progressoFile, 'utf8');
    // Find "7 Dias " followed by the fire SVG and replace it with just "7 Dias"
    content = content.replace(/7 Dias <svg[\s\S]*?<\/svg>/g, '7 Dias');
    content = content.replace(/7 Dias <svg[\s\S]*?<\/svg>/, '7 Dias');
    fs.writeFileSync(progressoFile, content, 'utf8');
}

console.log('Update done');
