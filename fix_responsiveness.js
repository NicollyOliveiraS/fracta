const fs = require('fs');
const path = require('path');

// 1. FIX CONQUISTAS MISSING ITEMS
const conquistasFile = 'd:/fracta/templates/conquistas.html';
if (fs.existsSync(conquistasFile)) {
    let cContent = fs.readFileSync(conquistasFile, 'utf8');
    
    const newGrid = `
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
    <div class="bg-white p-6 rounded-2xl border-2 border-[#C56E33] shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-scale" style="animation-delay: 0.05s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-[#C56E33] mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.499 4.499 0 00-1.757 4.306 4.438 4.438 0 002.946-2.946 4.5 4.5 0 004.306-1.758c-1.336-.363-2.583-1.018-3.64-1.89-1.05-.88-1.85-2.008-2.31-3.25z" /></svg></div>
        <span class="text-xs font-bold text-gray-900">Primeiros Passos</span>
        <span class="text-[10px] text-[#C56E33] font-medium mt-1">Desbloqueado!</span>
    </div>
    <div class="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in-scale" style="animation-delay: 0.1s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-amber-500 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg></div>
        <span class="text-xs font-bold text-gray-900">Mestre da Divisão</span>
        <span class="text-[10px] text-amber-600 font-medium mt-1">Desbloqueado!</span>
    </div>
    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center select-none animate-fade-in-scale" style="animation-delay: 0.15s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 20h18v2H3v-2zm18-11.5l-4.5 4.5L12 7l-4.5 6L3 8.5V18h18V8.5z" /></svg></div>
        <span class="text-xs font-medium text-gray-400">Rei das Frações</span>
        <span class="text-[10px] text-gray-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 inline text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Bloqueado</span>
    </div>
    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center select-none animate-fade-in-scale" style="animation-delay: 0.2s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clip-rule="evenodd" /></svg></div>
        <span class="text-xs font-medium text-gray-400">7 Dias Seguidos</span>
        <span class="text-[10px] text-gray-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 inline text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Bloqueado</span>
    </div>
    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center select-none animate-fade-in-scale" style="animation-delay: 0.25s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        <span class="text-xs font-medium text-gray-400">Nota Máxima</span>
        <span class="text-[10px] text-gray-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 inline text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Bloqueado</span>
    </div>
    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center select-none animate-fade-in-scale" style="animation-delay: 0.3s">
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg></div>
        <span class="text-xs font-medium text-gray-400">100% Acertos</span>
        <span class="text-[10px] text-gray-400 mt-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 inline text-gray-400"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg> Bloqueado</span>
    </div>
</div>
`;

    cContent = cContent.replace(/<div class="grid grid-cols-2[\s\S]*?<\/div>\s*<\/main>/, newGrid + '\n    </main>');
    fs.writeFileSync(conquistasFile, cContent, 'utf8');
}

// 2. MAKE ALL PAGES RESPONSIVE & FIX HEADERS + BODY min-h-screen
const pages = [
    { file: 'index.html', nav: 'inicio' },
    { file: 'templates/ajuda.html', nav: 'ajuda' },
    { file: 'templates/configuracao.html', nav: 'config' },
    { file: 'templates/conquistas.html', nav: 'conquistas' },
    { file: 'templates/progresso.html', nav: 'progresso' },
    { file: 'templates/atividade.html', nav: 'atividade' },
    { file: 'templates/conta.html', nav: 'conta' },
    { file: 'templates/adm.html', nav: 'adm' }
];

const genHeader = (isIndex, navCurrent) => `
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div class="flex items-center gap-10">
                <a href="${isIndex ? 'index.html' : '../index.html'}" class="flex items-center gap-3 group">
                    <img src="${isIndex ? 'img/image__1_-removebg-preview.png' : '../img/image__1_-removebg-preview.png'}" alt="Logo Fracta" class="w-24 h-auto object-contain mix-blend-multiply">
                </a>

                <nav class="hidden md:flex items-center gap-1.5 text-sm font-medium">
                    <a href="${isIndex ? 'index.html' : '../index.html'}" class="px-4 py-2 ${navCurrent === 'inicio' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Início</a>
                    <a href="${isIndex ? 'templates/progresso.html' : 'progresso.html'}" class="px-4 py-2 ${navCurrent === 'progresso' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Progresso</a>
                    <a href="${isIndex ? 'templates/conquistas.html' : 'conquistas.html'}" class="px-4 py-2 ${navCurrent === 'conquistas' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Conquistas</a>
                    <a href="${isIndex ? 'templates/configuracao.html' : 'configuracao.html'}" class="px-4 py-2 ${navCurrent === 'config' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Configuração</a>
                    <a href="${isIndex ? 'templates/ajuda.html' : 'ajuda.html'}" class="px-4 py-2 ${navCurrent === 'ajuda' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Ajuda</a>
                </nav>
            </div>

            <div class="flex items-center gap-3 sm:gap-4">
                <a href="${isIndex ? 'templates/conta.html' : 'conta.html'}" class="flex items-center gap-3 group">
                    <div class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-semibold text-sm transition-transform group-hover:scale-105">U</div>
                </a>
                
                <button id="mobileMenuBtn" class="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                    </svg>
                </button>
            </div>
        </div>

        <nav id="mobileMenu" class="hidden md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-1">
            <a href="${isIndex ? 'index.html' : '../index.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'inicio' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg">Início</a>
            <a href="${isIndex ? 'templates/progresso.html' : 'progresso.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'progresso' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Progresso</a>
            <a href="${isIndex ? 'templates/conquistas.html' : 'conquistas.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'conquistas' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Conquistas</a>
            <a href="${isIndex ? 'templates/configuracao.html' : 'configuracao.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'config' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Configuração</a>
            <a href="${isIndex ? 'templates/ajuda.html' : 'ajuda.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'ajuda' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Ajuda</a>
        </nav>
    </header>
`;

// Also add a little JS snippet to the end of body to handle mobileMenuBtn if not present
const mobileMenuScript = `
    <script>
        const _mbBtn = document.querySelector('#mobileMenuBtn');
        const _mMenu = document.querySelector('#mobileMenu');
        if (_mbBtn && _mMenu) {
            _mbBtn.addEventListener('click', () => _mMenu.classList.toggle('hidden'));
        }
    </script>
</body>
`;

pages.forEach(p => {
    const pPath = path.join('d:/fracta', p.file);
    if (!fs.existsSync(pPath)) return;
    let html = fs.readFileSync(pPath, 'utf8');

    // Make sure body has flex flex-col min-h-screen
    html = html.replace(/<body([^>]*)>/, (match, p1) => {
        let classes = p1;
        if (!classes.includes('min-h-screen')) classes += ' min-h-screen';
        if (!classes.includes('flex')) classes += ' flex flex-col';
        return `<body${classes}>`;
    });

    // Replace header
    const isIndex = p.file === 'index.html';
    const headerStr = genHeader(isIndex, p.nav);
    html = html.replace(/<header[\s\S]*?<\/header>/, headerStr);

    // Fix mobileMenuBtnIndex script conflicts (remove old ones if any)
    html = html.replace(/const mobileMenuBtnIndex[\s\S]*?}\);/g, '');

    // Add unified mobile menu script right before </body>
    if (!html.includes("document.querySelector('#mobileMenuBtn')")) {
        html = html.replace(/<\/body>/, mobileMenuScript);
    }

    fs.writeFileSync(pPath, html, 'utf8');
});

console.log('Fixed header responsiveness and conquistas grid');
