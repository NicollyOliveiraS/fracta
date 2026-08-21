const fs = require('fs');
const path = require('path');

// 1. Smaller Footer
const files = [
    { file: 'index.html', logo: 'img/image__1_-removebg-preview.png', ajuda: 'templates/ajuda.html', config: 'templates/configuracao.html' },
    { file: 'templates/ajuda.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/configuracao.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/conquistas.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/conta.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/progresso.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/atividade.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' },
    { file: 'templates/adm.html', logo: '../img/image__1_-removebg-preview.png', ajuda: 'ajuda.html', config: 'configuracao.html' }
];

const newFooterTemplate = `
    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white mt-auto w-full">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                    <img src="__LOGO_PATH__" alt="Logo Fracta" class="w-16 h-auto object-contain">
                    <div class="h-4 w-[1px] bg-gray-200 hidden md:block"></div>
                    <p class="text-xs text-gray-500 font-medium hidden md:block">Plataforma de Aprendizado Interativo</p>
                </div>
                
                <div class="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <a href="__AJUDA_PATH__" class="hover:text-amber-600 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                        Suporte
                    </a>
                    <a href="__CONFIG_PATH__" class="hover:text-amber-600 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Configurações
                    </a>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2">
                <p class="text-[10px] text-gray-400">© 2025 FRACTA. Todos os direitos reservados.</p>
                <div class="flex gap-4">
                    <a href="#" class="text-[10px] text-gray-400 hover:text-amber-600 transition">Termos de Uso</a>
                    <a href="#" class="text-[10px] text-gray-400 hover:text-amber-600 transition">Privacidade</a>
                </div>
            </div>
        </div>
    </footer>
`;

files.forEach(item => {
    const filePath = path.join('d:/fracta', item.file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    const specificFooter = newFooterTemplate
        .replace(/__LOGO_PATH__/g, item.logo)
        .replace(/__AJUDA_PATH__/g, item.ajuda)
        .replace(/__CONFIG_PATH__/g, item.config);
    content = content.replace(/<!-- Footer -->[\s\S]*?<\/footer>/, specificFooter);
    fs.writeFileSync(filePath, content, 'utf8');
});

// 2. Fix medals and fire
const fileProgresso = 'd:/fracta/templates/progresso.html';
if (fs.existsSync(fileProgresso)) {
    let pContent = fs.readFileSync(fileProgresso, 'utf8');
    // Replace fire emoji in "7 Dias"
    const fireSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-orange-500 inline-block mb-1"><path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248z" clip-rule="evenodd" /></svg>`;
    pContent = pContent.replace(/7 Dias |7 Dias 🔥/, `7 Dias ${fireSVG}`);
    
    // Replace medals
    const m1 = `<div class="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">1</div>`;
    const m2 = `<div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm ring-2 ring-white">2</div>`;
    const m3 = `<div class="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white">3</div>`;
    
    pContent = pContent.replace(/<span class="text-lg">🥇<\/span>|<span class="text-lg"><\/span>/g, m1)
                       .replace(/<span class="text-lg">🥈<\/span>|<span class="text-lg"><\/span>/g, m2)
                       .replace(/<span class="text-lg">🥉<\/span>|<span class="text-lg"><\/span>/g, m3);
    fs.writeFileSync(fileProgresso, pContent, 'utf8');
}

// 3. Rewrite Conquistas grid
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
        <div class="text-4xl mb-3"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg></div>
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
    cContent = cContent.replace(/<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">[\s\S]*?<\/main>/, newGrid + '\n    </main>');
    fs.writeFileSync(conquistasFile, cContent, 'utf8');
}
console.log('All updates complete.');
