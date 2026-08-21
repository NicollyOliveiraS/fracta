const fs = require('fs');

const progFile = 'd:/fracta/templates/progresso.html';
if (fs.existsSync(progFile)) {
    let content = fs.readFileSync(progFile, 'utf8');

    // We will replace the whole ranking section
    const newRankingHtml = `
        <!-- Ranking -->
        <div class="bg-white p-4 sm:p-8 rounded-2xl border border-gray-200 shadow-sm animate-fade-in-up" style="animation-delay: 0.3s">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-gray-900">Ranking da Turma</h3>
                <span class="text-xs font-semibold text-[#C56E33] bg-[#C56E33]/10 px-3 py-1 rounded-full">Esta Semana</span>
            </div>

            <!-- Pódio -->
            <div id="podioContainer" class="flex items-end justify-center gap-2 sm:gap-4 mb-8">
                <div class="text-sm text-gray-400">Carregando ranking da API...</div>
            </div>

            <!-- Lista completa -->
            <div id="listaRankingContainer" class="space-y-2">
            </div>
        </div>
`;

    // Replace everything from <!-- Ranking --> to </main>
    content = content.replace(/<!-- Ranking -->[\s\S]*?<\/main>/, newRankingHtml + '\n    </main>');

    // Remove the old script that just overrode #rankingNomeTopo
    content = content.replace(/\/\/ Atualizar ranking com nome do usuário logado[\s\S]*?}<\/script>/, '</script>');

    // Add the new JS logic for fetching from API
    const newScript = `
        const URL_BACKEND = "https://backend-tcc-tv2u.vercel.app";
        const usuarioLogado = localStorage.getItem("usuario");

        async function carregarRanking() {
            try {
                const res = await fetch(URL_BACKEND + '/usuarios');
                if (!res.ok) throw new Error('API Falhou');
                let users = await res.json();
                
                // Filtra alunos
                users = users.filter(u => u.tipo_usuario !== 'professor');
                
                let userSelf = users.find(u => u.email === usuarioLogado || u.nome === usuarioLogado);
                if(!userSelf && usuarioLogado) {
                    userSelf = { nome: usuarioLogado, email: usuarioLogado, isSelf: true };
                    users.unshift(userSelf);
                } else if (userSelf) {
                    userSelf.isSelf = true;
                }

                let topUsers = users.slice(0, 5);
                const mockNotas = [9.5, 8.8, 8.2, 7.5, 7.1];
                
                topUsers = topUsers.map((u, i) => {
                    return {
                        nome: u.nome || u.email || 'Aluno',
                        nota: mockNotas[i] || 7.0,
                        isSelf: !!u.isSelf
                    };
                });

                renderizarRanking(topUsers);
            } catch(e) {
                console.error(e);
                document.getElementById('podioContainer').innerHTML = '<div class="text-sm text-red-400">Erro ao carregar ranking da API</div>';
            }
        }

        function renderizarRanking(users) {
            const podio = document.getElementById('podioContainer');
            const lista = document.getElementById('listaRankingContainer');
            
            if(users.length < 3) {
                while(users.length < 3) users.push({nome: '...', nota: 0});
            }

            const p2 = users[1];
            const p1 = users[0];
            const p3 = users[2];

            const renderPodioItem = (user, place, height) => {
                const inicial = user.nome ? user.nome.charAt(0).toUpperCase() : '?';
                const isFirst = place === 1;
                const bgColor = isFirst ? 'bg-[#C56E33]' : 'bg-gray-100';
                const textColor = isFirst ? 'text-white' : 'text-gray-500';
                const boxColor = isFirst ? 'bg-[#C56E33]/10 border-2 border-[#C56E33]' : 'bg-gray-100';
                const nameColor = isFirst ? 'text-[#C56E33]' : 'text-gray-500';
                const medalBg = isFirst ? 'bg-amber-400' : (place === 2 ? 'bg-gray-300' : 'bg-orange-400');
                
                return \`
                <div class="flex flex-col items-center gap-2 max-w-[30%]">
                    <div class="w-10 h-10 rounded-xl \${bgColor} flex items-center justify-center text-base font-bold \${textColor}">\${inicial}</div>
                    <div class="w-24 sm:w-28 \${boxColor} rounded-t-xl flex flex-col items-center justify-center pt-3 pb-2" style="height:\${height}px">
                        <div class="w-6 h-6 rounded-full \${medalBg} flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-white mb-1">\${place}</div>
                        <span class="text-[10px] font-bold \${nameColor} mt-1 w-full text-center" style="word-break: break-word; white-space: normal; line-height: 1.1; padding: 0 4px;">\${user.nome}</span>
                        <span class="text-[10px] \${nameColor} font-semibold mt-0.5">\${user.nota}</span>
                    </div>
                </div>\`;
            };

            podio.innerHTML = 
                renderPodioItem(p2, 2, 80) + 
                renderPodioItem(p1, 1, 110) + 
                renderPodioItem(p3, 3, 65);

            lista.innerHTML = users.map((u, i) => {
                const pos = i + 1;
                const isSelf = u.isSelf;
                const containerClass = isSelf 
                    ? 'flex items-center gap-2 sm:gap-4 bg-[#C56E33]/5 border border-[#C56E33]/20 rounded-xl px-2 sm:px-4 py-3'
                    : 'flex items-center gap-2 sm:gap-4 rounded-xl px-2 sm:px-4 py-3 hover:bg-gray-50 transition';
                
                const rankColor = isSelf ? 'text-[#C56E33]' : 'text-gray-400';
                const avatarBg = isSelf ? 'bg-[#C56E33]' : 'bg-gray-200';
                const avatarText = isSelf ? 'text-white' : 'text-gray-600';
                
                return \`
                <div class="\${containerClass}">
                    <span class="text-sm font-extrabold \${rankColor} w-4 text-center">\${pos}</span>
                    <div class="w-8 h-8 rounded-lg \${avatarBg} flex items-center justify-center \${avatarText} font-bold text-xs flex-shrink-0">\${u.nome ? u.nome.charAt(0).toUpperCase() : '?'}</div>
                    <span class="flex-1 text-xs sm:text-sm font-medium text-gray-900 truncate" title="\${u.nome}">\${u.nome}</span>
                    <span class="text-sm font-bold \${isSelf ? 'text-[#C56E33]' : 'text-gray-600'}">\${u.nota}</span>
                    \${isSelf ? '<span class="text-[10px] text-[#C56E33] font-medium bg-[#C56E33]/10 px-2 py-0.5 rounded-full hidden sm:inline-block">Você</span>' : ''}
                </div>\`;
            }).join('');
        }

        carregarRanking();
    </script>
</body>`;
    
    // add it to the end
    if(!content.includes('carregarRanking()')) {
        content = content.replace(/<\/body>/, newScript);
    }
    
    fs.writeFileSync(progFile, content, 'utf8');
}
console.log('Fixed API integration and podium wrap display');
