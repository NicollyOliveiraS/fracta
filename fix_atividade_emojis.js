const fs = require('fs');

const atividadeFile = 'd:/fracta/templates/atividade.html';
if (fs.existsSync(atividadeFile)) {
    let content = fs.readFileSync(atividadeFile, 'utf8');
    
    // Replace the remaining emojis in the JS array that didn't get caught
    // line 436: 🌟, line 438: 👍, line 440: 📚, line 442: 💪
    const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline text-amber-500"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`;
    const checkBadgeSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline text-green-500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>`;
    const bookSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline text-blue-500"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`;
    const muscleSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline text-red-500"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>`;

    content = content.replace(/emoji = '🌟'/g, `emoji = '${starSVG}'`)
                     .replace(/emoji = '👍'/g, `emoji = '${checkBadgeSVG}'`)
                     .replace(/emoji = '📚'/g, `emoji = '${bookSVG}'`)
                     .replace(/emoji = '💪'/g, `emoji = '${muscleSVG}'`);
                     
    // Just in case they are completely garbled like '??' in my read:
    // They are on specific lines, so I will replace by text search:
    content = content.replace(/emoji = '.{1,2}'; titulo = 'Muito bem!'/g, `emoji = '${starSVG}'; titulo = 'Muito bem!'`)
                     .replace(/emoji = '.{1,2}'; titulo = 'Bom trabalho!'/g, `emoji = '${checkBadgeSVG}'; titulo = 'Bom trabalho!'`)
                     .replace(/emoji = '.{1,2}'; titulo = 'Continue estudando!'/g, `emoji = '${bookSVG}'; titulo = 'Continue estudando!'`)
                     .replace(/emoji = '.{1,2}'; titulo = 'Não desista!'/g, `emoji = '${muscleSVG}'; titulo = 'Não desista!'`)
                     .replace(/emoji = '.{1,2}'; titulo = 'No desista!'/g, `emoji = '${muscleSVG}'; titulo = 'No desista!'`);
                     
    fs.writeFileSync(atividadeFile, content, 'utf8');
}
console.log('Fixed final emojis in atividade.html');
