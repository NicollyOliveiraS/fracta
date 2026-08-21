const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'templates/ajuda.html',
    'templates/configuracao.html',
    'templates/conquistas.html',
    'templates/conta.html',
    'templates/progresso.html',
    'templates/atividade.html',
    'templates/adm.html'
];

files.forEach(file => {
    const filePath = path.join('d:/fracta', file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Normalize body background to exactly bg-gray-100 (Ferretto style)
    content = content.replace(/<body class="[^"]*"/g, (match) => {
        let newClasses = match.replace(/bg-\[#[A-Fa-f0-9]+\]/g, '')
                              .replace(/bg-slate-[0-9]+/g, '')
                              .replace(/bg-gray-[0-9]+/g, '')
                              .replace(/text-\[#[A-Fa-f0-9]+\]/g, '')
                              .replace(/text-slate-[0-9]+/g, '')
                              .replace(/bg-white/g, '');
        // Clean up double spaces
        newClasses = newClasses.replace(/\s+/g, ' ').replace('class=" ', 'class="');
        // Add bg-gray-100 and text-gray-800
        return newClasses.replace('class="', 'class="bg-gray-100 text-gray-800 ');
    });

    // Replace other backgrounds used for cards (which should be white)
    content = content.replace(/bg-\[#FDF9F6\]/g, 'bg-white')
                     .replace(/bg-\[#FBFBFA\]/g, 'bg-white')
                     .replace(/bg-\[#F2EBE3\]/g, 'bg-white');

    // Replace borders to gray-200
    content = content.replace(/border-\[#EDE5DC\]/g, 'border-gray-200')
                     .replace(/border-\[#E0D4C7\]/g, 'border-gray-200')
                     .replace(/border-gray-100/g, 'border-gray-200');

    // Replace hover/secondary backgrounds to gray-50
    content = content.replace(/bg-\[#F5EDE4\]/g, 'bg-gray-50')
                     .replace(/bg-\[#EAE0D6\]/g, 'bg-gray-50');

    // Replace text colors
    content = content.replace(/text-\[#2C1A11\]/g, 'text-gray-900')
                     .replace(/text-slate-800/g, 'text-gray-900')
                     .replace(/bg-\[#2C1A11\]/g, 'bg-gray-900'); // the avatar bg

    // Opacity fixes
    content = content.replace(/bg-white\/90/g, 'bg-white/90'); // keep header blur good

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
});
