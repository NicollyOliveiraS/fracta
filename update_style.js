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
    
    // Replace body background explicitly to slate-50 (grayish background)
    content = content.replace(/<body class="bg-\[#FDF9F6\]/g, '<body class="bg-slate-50');
    
    // Replace all other #FDF9F6 (which are cards, headers, footers) to white
    content = content.replace(/bg-\[#FDF9F6\]/g, 'bg-white');
    
    // Replace borders to a clean light gray
    content = content.replace(/border-\[#EDE5DC\]/g, 'border-slate-200');
    
    // Replace secondary backgrounds (hover states, etc) to slate-100
    content = content.replace(/bg-\[#F5EDE4\]/g, 'bg-slate-100');
    
    // Replace text color to slate-800 for a clean look
    content = content.replace(/text-\[#2C1A11\]/g, 'text-slate-800');
    content = content.replace(/bg-\[#2C1A11\]/g, 'bg-slate-800');
    
    // Replace text-gray-500 hover states if necessary (leave as is for now)

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + file);
});
