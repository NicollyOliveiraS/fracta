const fs = require('fs');

// Remove Fire from 7 Dias in progresso.html
const progressoFile = 'd:/fracta/templates/progresso.html';
if (fs.existsSync(progressoFile)) {
    let content = fs.readFileSync(progressoFile, 'utf8');
    // Just find the div containing 7 Dias and replace its whole content
    content = content.replace(/<div class="text-4xl font-extrabold text-amber-600">7 Dias.*?<\/div>/g, '<div class="text-4xl font-extrabold text-amber-600">7 Dias</div>');
    fs.writeFileSync(progressoFile, content, 'utf8');
}
console.log('Fixed progresso');
