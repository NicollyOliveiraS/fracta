const fs = require('fs');
const path = require('path');

// 1. Fix Clock Emoji in ajuda.html
const ajudaFile = 'd:/fracta/templates/ajuda.html';
if (fs.existsSync(ajudaFile)) {
    let content = fs.readFileSync(ajudaFile, 'utf8');
    const clockSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    content = content.replace(/🕒|&olock;/g, clockSVG); // replace emoji
    fs.writeFileSync(ajudaFile, content, 'utf8');
}

// 2. Fix Podium Name Overflow in progresso.html
const progressoFile = 'd:/fracta/templates/progresso.html';
if (fs.existsSync(progressoFile)) {
    let content = fs.readFileSync(progressoFile, 'utf8');
    // Add truncate and max-width to the rankingNomeTopo
    content = content.replace(/id="rankingNomeTopo"/g, 'id="rankingNomeTopo" class="text-[10px] font-bold text-[#C56E33] mt-1 truncate w-full px-1 text-center"');
    // Also fix Maria and Pedro in the podium to ensure they don't overflow either
    content = content.replace(/<span class="text-\[10px\] font-bold text-gray-500 mt-1">Maria<\/span>/, '<span class="text-[10px] font-bold text-gray-500 mt-1 truncate w-full px-1 text-center">Maria</span>');
    content = content.replace(/<span class="text-\[10px\] font-bold text-gray-500 mt-1">Pedro<\/span>/, '<span class="text-[10px] font-bold text-gray-500 mt-1 truncate w-full px-1 text-center">Pedro</span>');
    
    // Actually the previous replacement for the podium might have altered classes. Let's just do a blanket replacement for the name spans
    content = content.replace(/<span class="text-\[10px\] font-bold text-\[\#C56E33\] mt-1" id="rankingNomeTopo">.*?<\/span>/, '<span class="text-[10px] font-bold text-[#C56E33] mt-1 truncate w-full px-1 text-center" id="rankingNomeTopo">Você</span>');
    fs.writeFileSync(progressoFile, content, 'utf8');
}

// 3. Restore Header with User Name & Logout
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

const genHeaderRestored = (isIndex, navCurrent) => `
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

            <div class="flex items-center gap-3 sm:gap-5">
                <button id="mobileMenuBtn" class="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                    </svg>
                </button>
                
                <div class="hidden sm:block h-6 w-[1px] bg-gray-200"></div>

                <div class="flex items-center gap-4">
                    <a href="${isIndex ? 'templates/conta.html' : 'conta.html'}" class="flex items-center gap-3 group">
                        <div id="avatarUsuario" class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white font-semibold text-sm transition-transform group-hover:scale-105">U</div>
                        <div class="hidden sm:block text-left">
                            <p id="nomeUsuarioHeader" class="text-sm font-semibold text-gray-800 leading-none mb-0.5 truncate max-w-[100px]">Usuário</p>
                            <p class="text-xs text-gray-400 leading-none">Estudante</p>
                        </div>
                    </a>
                    <a href="${isIndex ? 'templates/login.html' : 'login.html'}">
                        <button class="btnSair ml-2 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50/50 transition hidden sm:block" title="Sair da conta">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </a>
                </div>
            </div>
        </div>

        <!-- Mobile nav -->
        <nav id="mobileMenu" class="hidden md:hidden border-t border-gray-200 bg-white px-6 py-4 space-y-1">
            <a href="${isIndex ? 'index.html' : '../index.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'inicio' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg">Início</a>
            <a href="${isIndex ? 'templates/progresso.html' : 'progresso.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'progresso' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Progresso</a>
            <a href="${isIndex ? 'templates/conquistas.html' : 'conquistas.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'conquistas' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Conquistas</a>
            <a href="${isIndex ? 'templates/configuracao.html' : 'configuracao.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'config' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Configuração</a>
            <a href="${isIndex ? 'templates/ajuda.html' : 'ajuda.html'}" class="block px-4 py-2.5 text-sm font-medium ${navCurrent === 'ajuda' ? 'text-[#C56E33] bg-[#C56E33]/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'} rounded-lg transition">Ajuda</a>
            <hr class="my-2 border-gray-100">
            <a href="${isIndex ? 'templates/login.html' : 'login.html'}" class="block px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition">Sair</a>
        </nav>
    </header>
`;

pages.forEach(p => {
    const pPath = path.join('d:/fracta', p.file);
    if (!fs.existsSync(pPath)) return;
    let html = fs.readFileSync(pPath, 'utf8');

    const isIndex = p.file === 'index.html';
    const headerStr = genHeaderRestored(isIndex, p.nav);
    
    // Replace the header completely
    html = html.replace(/<header[\s\S]*?<\/header>/, headerStr);

    fs.writeFileSync(pPath, html, 'utf8');
});

console.log('Restored header and fixed podium overflow');
