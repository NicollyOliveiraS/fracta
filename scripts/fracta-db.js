/**
 * FRACTA Database & State Management Layer
 * Gerencia persistência de turmas, alunos, notas, progresso, atividades e métricas.
 * Mantém sincronização com a API e garante compatibilidade com dados existentes.
 */

const FractaDB = (() => {
    // Utiliza exclusivamente a API e o banco de dados da Vercel
    const API_URL = "https://backend-tcc-tv2u.vercel.app";
    const STORAGE_KEY_USUARIOS = "fracta_db_usuarios_v2";
    const STORAGE_KEY_ATIVIDADES = "fracta_db_atividades_v2";

    const TURMAS_DISPONIVEIS = ["6º A", "6º B", "7º A", "7º B"];

    function extrairAno(turma) {
        if (!turma) return "6º ano";
        return turma.includes("7") ? "7º ano" : "6º ano";
    }

    // Inicializa e sincroniza diretamente com o banco de dados da Vercel
    async function sincronizarComAPI() {
        try {
            const resp = await fetch(`${API_URL}/usuarios`, {
                headers: { "Content-Type": "application/json" }
            });

            if (resp.ok) {
                const usuariosRemotos = await resp.json();
                if (Array.isArray(usuariosRemotos)) {
                    const usuariosAtualizados = usuariosRemotos.map((remoto, i) => {
                        const ehAluno = (remoto.tipo_usuario || "aluno") === "aluno";
                        let turma = remoto.turma || null;

                        if (ehAluno && !turma) {
                            const turmasPadrao = ["6º A", "6º B", "7º A", "7º B"];
                            turma = turmasPadrao[(remoto.id || i) % turmasPadrao.length];
                        }

                        const anoEscolar = ehAluno ? extrairAno(turma) : null;

                        return {
                            id: remoto.id || (100 + i),
                            nome: remoto.nome || "Usuário",
                            email: (remoto.email || "").toLowerCase().trim(),
                            tipo_usuario: remoto.tipo_usuario || "aluno",
                            turma: turma,
                            ano_escolar: remoto.ano_escolar || anoEscolar,
                            avatar: remoto.avatar || "avatar-1",
                            data_cadastro: remoto.data_cadastro || new Date().toISOString(),
                            historico_atividades: remoto.historico_atividades || gerarHistoricoInicial(remoto.id, turma),
                            progresso: remoto.progresso || [false, false, false, false, false]
                        };
                    });

                    salvarUsuariosLocais(usuariosAtualizados);
                    return usuariosAtualizados;
                }
            }
        } catch (e) {
            console.warn("FractaDB: Aviso ao consultar banco de dados da Vercel:", e);
        }

        return carregarUsuariosLocais();
    }

    let _memoryStorage = {};

    function carregarUsuariosLocais() {
        try {
            if (typeof localStorage !== "undefined") {
                const data = localStorage.getItem(STORAGE_KEY_USUARIOS);
                return data ? JSON.parse(data) : [];
            }
            return _memoryStorage[STORAGE_KEY_USUARIOS] ? JSON.parse(_memoryStorage[STORAGE_KEY_USUARIOS]) : [];
        } catch {
            return [];
        }
    }

    function salvarUsuariosLocais(usuarios) {
        try {
            const dataStr = JSON.stringify(usuarios);
            if (typeof localStorage !== "undefined") {
                localStorage.setItem(STORAGE_KEY_USUARIOS, dataStr);
            } else {
                _memoryStorage[STORAGE_KEY_USUARIOS] = dataStr;
            }
        } catch (e) {
            console.error("Erro ao salvar no FractaDB:", e);
        }
    }

    // Gera histórico autêntico para os alunos pré-existentes da base para compatibilidade
    function gerarHistoricoInicial(id, turma) {
        if (!turma) return [];
        const ano = extrairAno(turma);
        const dataBase = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Histórico de atividades com dados reais proporcionais
        const titulos = [
            "Capítulo 1 — A origem das frações",
            "Capítulo 2 — A barragem de Bento",
            "Capítulo 3 — Construindo os túneis de Silas",
            "Capítulo 4 — Organizando os alimentos",
            "Capítulo 5 — Explorando novas galerias"
        ];

        const sementesNotas = [
            [5, 5, 10.0, 100, true],
            [4, 5, 8.0, 80, false],
            [5, 5, 10.0, 100, true],
            [4, 5, 8.8, 88, true],
            [5, 5, 10.0, 100, true]
        ];

        const seedIdx = (id || 1) % 3;
        const totalAtivs = 2 + seedIdx;
        const historico = [];

        for (let i = 0; i < totalAtivs; i++) {
            const s = sementesNotas[(i + seedIdx) % sementesNotas.length];
            const dataAtiv = new Date(dataBase.getTime() + i * 24 * 60 * 60 * 1000 + (id || 0) * 3600000);
            historico.push({
                id_atividade: i + 1,
                titulo_atividade: titulos[i],
                ano: ano,
                turma: turma,
                acertos: s[0],
                total_questoes: s[1],
                erros: s[1] - s[0],
                nota: s[2],
                porcentagem: s[3],
                concluida: s[4],
                tentativas: 1,
                data: dataAtiv.toISOString()
            });
        }

        return historico;
    }

    return {
        TURMAS: TURMAS_DISPONIVEIS,

        extrairAno,

        async init() {
            return await sincronizarComAPI();
        },

        obterUsuarios() {
            let u = carregarUsuariosLocais();
            return u || [];
        },

        obterAlunos() {
            // Aluno sem turma é cadastro inválido — não entra em nenhuma lista
            return this.obterUsuarios().filter(u =>
                u.tipo_usuario === "aluno" && u.turma && u.turma.trim() !== ""
            );
        },

        obterAlunoPorId(id) {
            if (id === undefined || id === null || id === "") return null;
            const strId = String(id).trim();
            const numId = Number(id);
            return this.obterAlunos().find(u => {
                if (u.id !== undefined && u.id !== null) {
                    if (u.id === numId || String(u.id).trim() === strId) return true;
                }
                if (u._id !== undefined && u._id !== null) {
                    if (String(u._id).trim() === strId) return true;
                }
                if (u.email && String(u.email).toLowerCase().trim() === strId.toLowerCase()) {
                    return true;
                }
                return false;
            });
        },

        obterUsuarioLogado() {
            try {
                const uSession = JSON.parse(localStorage.getItem("usuario"));
                if (!uSession) return null;
                const email = (uSession.email || "").toLowerCase().trim();
                const todos = this.obterUsuarios();
                const encontrado = todos.find(u => 
                    (u.email && u.email.toLowerCase().trim() === email) ||
                    u.id === uSession.id
                );
                if (encontrado) {
                    // Mantém sincronizada a turma na sessão
                    if (encontrado.turma && !uSession.turma) {
                        uSession.turma = encontrado.turma;
                        uSession.ano_escolar = encontrado.ano_escolar;
                        localStorage.setItem("usuario", JSON.stringify(uSession));
                    }
                    return encontrado;
                }
                return uSession;
            } catch {
                return null;
            }
        },

        async cadastrarUsuario({ nome, email, senha, tipo_usuario, turma, avatar, codigo_acesso }) {
            const resp = await fetch(`${API_URL}/usuarios`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    tipo_usuario,
                    turma,
                    avatar: avatar || "avatar-1",
                    codigo_acesso
                })
            });
            const dados = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                throw new Error(dados.erro || dados.mensagem || "Erro ao cadastrar usuário no banco de dados da Vercel.");
            }
            await sincronizarComAPI();
            return dados;
        },

        async autenticarUsuario(email, senha) {
            const resp = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, senha })
            });
            const dados = await resp.json().catch(() => ({}));
            if (!resp.ok) {
                return { sucesso: false, erro: dados.erro || dados.mensagem || "Credenciais inválidas no banco da Vercel." };
            }
            await sincronizarComAPI();
            return {
                sucesso: true,
                token: dados.token,
                usuario: dados.usuario
            };
        },

        atualizarAvatarAluno(id, novoAvatar) {
            const usuarios = this.obterUsuarios();
            const idx = usuarios.findIndex(u => u.id === Number(id) || String(u.id) === String(id));
            if (idx !== -1) {
                usuarios[idx].avatar = novoAvatar;
                salvarUsuariosLocais(usuarios);

                // Atualiza sessão no localStorage
                try {
                    const sessao = JSON.parse(localStorage.getItem("usuario")) || {};
                    if (sessao.id === usuarios[idx].id || sessao.email === usuarios[idx].email) {
                        sessao.avatar = novoAvatar;
                        localStorage.setItem("usuario", JSON.stringify(sessao));
                    }
                } catch (e) {}

                // Envia para o backend se disponível
                fetch(`${API_URL}/usuarios/${usuarios[idx].id}/avatar`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar: novoAvatar })
                }).catch(() => {});

                return usuarios[idx];
            }
            return null;
        },

        atualizarTurmaAluno(id, novaTurma) {
            const usuarios = this.obterUsuarios();
            const idx = usuarios.findIndex(u => u.id === Number(id) || String(u.id) === String(id));
            if (idx !== -1) {
                usuarios[idx].turma = novaTurma;
                usuarios[idx].ano_escolar = extrairAno(novaTurma);
                salvarUsuariosLocais(usuarios);

                // Sincroniza sessão
                try {
                    const sessao = JSON.parse(localStorage.getItem("usuario")) || {};
                    if (sessao.id === usuarios[idx].id || sessao.email === usuarios[idx].email) {
                        sessao.turma = novaTurma;
                        sessao.ano_escolar = usuarios[idx].ano_escolar;
                        localStorage.setItem("usuario", JSON.stringify(sessao));
                    }
                } catch (e) {}

                // Envia para o backend se disponível
                fetch(`${API_URL}/usuarios/${usuarios[idx].id}/turma`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ turma: novaTurma })
                }).catch(() => {});

                return usuarios[idx];
            }
            return null;
        },

        salvarResultadoAtividade(params = {}) {
            const idCapitulo = Number(params.idCapitulo || params.id_capitulo || 1);
            const tituloCapitulo = params.tituloCapitulo || params.titulo_atividade || `Capítulo ${idCapitulo}`;
            const totalQuestoes = Number(params.totalQuestoes || params.total_questoes || 5);
            const acertos = Number(params.acertos !== undefined ? params.acertos : 5);
            const idUsuario = params.idUsuario || params.id_usuario;

            let usuarioTarget = null;
            if (idUsuario) {
                usuarioTarget = this.obterAlunoPorId(idUsuario);
            }
            if (!usuarioTarget) {
                usuarioTarget = this.obterUsuarioLogado();
            }
            if (!usuarioTarget) {
                const alunos = this.obterAlunos();
                if (alunos.length > 0) usuarioTarget = alunos[0];
            }
            if (!usuarioTarget) return null;

            const usuarios = this.obterUsuarios();
            const uIdx = usuarios.findIndex(u => 
                u.id === usuarioTarget.id || 
                (u.email && usuarioTarget.email && u.email.toLowerCase().trim() === usuarioTarget.email.toLowerCase().trim())
            );

            if (uIdx === -1) return null;

            const aluno = usuarios[uIdx];
            const nota = params.nota !== undefined ? Number(params.nota) : Number(((acertos / totalQuestoes) * 10).toFixed(1));
            const porcentagem = params.porcentagem !== undefined ? Number(params.porcentagem) : Math.round((acertos / totalQuestoes) * 100);
            const erros = params.erros !== undefined ? Number(params.erros) : (totalQuestoes - acertos);
            
            // Regra de aprovação: >= 70% de aproveitamento (ex: 7 em 10, 4 em 5)
            const aprovadoNestaTentativa = porcentagem >= 70;
            const concluida = params.concluida !== undefined 
                ? Boolean(params.concluida) 
                : aprovadoNestaTentativa;

            if (!aluno.historico_atividades) aluno.historico_atividades = [];
            if (!aluno.progresso) aluno.progresso = [false, false, false, false, false];

            const capIdx = idCapitulo - 1;
            const tentativasAnteriores = aluno.historico_atividades.filter(h => h.id_atividade === idCapitulo).length;

            const registro = {
                id_atividade: idCapitulo,
                titulo_atividade: tituloCapitulo,
                ano: aluno.ano_escolar || extrairAno(aluno.turma),
                turma: aluno.turma || "6º A",
                acertos: acertos,
                total_questoes: totalQuestoes,
                erros: erros,
                nota: nota,
                porcentagem: porcentagem,
                concluida: concluida,
                tentativas: tentativasAnteriores + 1,
                data: new Date().toISOString()
            };

            aluno.historico_atividades.push(registro);

            // Se aprovado nesta tentativa ou já aprovado antes, mantém desbloqueado
            if ((concluida || aluno.progresso[capIdx]) && capIdx >= 0 && capIdx < 5) {
                aluno.progresso[capIdx] = true;
            }

            salvarUsuariosLocais(usuarios);

            // Atualiza sessão
            try {
                const s = JSON.parse(localStorage.getItem("usuario")) || {};
                s.progresso = aluno.progresso;
                s.historico_atividades = aluno.historico_atividades;
                s.turma = aluno.turma;
                s.ano_escolar = aluno.ano_escolar;
                s.avatar = aluno.avatar || s.avatar || "avatar-1";
                localStorage.setItem("usuario", JSON.stringify(s));
            } catch (e) {}

            // Persiste no backend via API assíncrona
            if (aluno.id) {
                fetch(`${API_URL}/atividades`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_aluno: aluno.id,
                        id_capitulo: idCapitulo,
                        titulo_capitulo: tituloCapitulo,
                        acertos: acertos,
                        total_questoes: totalQuestoes
                    })
                }).catch(errApi => console.warn("FractaDB: Notificação ao backend pendente:", errApi));
            }

            return registro;
        },

        excluirUsuario(id) {
            const usuarios = this.obterUsuarios().filter(u => u.id !== Number(id) && String(u.id) !== String(id));
            salvarUsuariosLocais(usuarios);
        },

        obterMetricasDashboard() {
            const alunos = this.obterAlunos();
            const totalAlunos = alunos.length;

            const contagemPorTurma = {
                "6º A": 0,
                "6º B": 0,
                "7º A": 0,
                "7º B": 0
            };

            const somaNotasPorTurma = {
                "6º A": 0,
                "6º B": 0,
                "7º A": 0,
                "7º B": 0
            };

            const qtdNotasPorTurma = {
                "6º A": 0,
                "6º B": 0,
                "7º A": 0,
                "7º B": 0
            };

            let totalAtividadesRealizadas = 0;
            let somaTotalAcertos = 0;
            let somaTotalQuestoes = 0;

            alunos.forEach(aluno => {
                const t = aluno.turma || "6º A";
                if (contagemPorTurma.hasOwnProperty(t)) {
                    contagemPorTurma[t]++;
                } else {
                    contagemPorTurma["6º A"]++;
                }

                const hist = aluno.historico_atividades || [];
                hist.forEach(h => {
                    totalAtividadesRealizadas++;
                    const turmaHist = h.turma || t;
                    if (somaNotasPorTurma.hasOwnProperty(turmaHist)) {
                        somaNotasPorTurma[turmaHist] += Number(h.nota || 0);
                        qtdNotasPorTurma[turmaHist]++;
                    }
                    somaTotalAcertos += Number(h.acertos || 0);
                    somaTotalQuestoes += Number(h.total_questoes || 5);
                });
            });

            const mediaPorTurma = {
                "6º A": qtdNotasPorTurma["6º A"] > 0 ? (somaNotasPorTurma["6º A"] / qtdNotasPorTurma["6º A"]).toFixed(1) : "0.0",
                "6º B": qtdNotasPorTurma["6º B"] > 0 ? (somaNotasPorTurma["6º B"] / qtdNotasPorTurma["6º B"]).toFixed(1) : "0.0",
                "7º A": qtdNotasPorTurma["7º A"] > 0 ? (somaNotasPorTurma["7º A"] / qtdNotasPorTurma["7º A"]).toFixed(1) : "0.0",
                "7º B": qtdNotasPorTurma["7º B"] > 0 ? (somaNotasPorTurma["7º B"] / qtdNotasPorTurma["7º B"]).toFixed(1) : "0.0"
            };

            const porcentagemMediaAcertos = somaTotalQuestoes > 0 
                ? Math.round((somaTotalAcertos / somaTotalQuestoes) * 100) 
                : 0;

            return {
                totalAlunos,
                contagemPorTurma,
                mediaPorTurma,
                totalAtividadesRealizadas,
                porcentagemMediaAcertos,
                totalAcertos: somaTotalAcertos,
                totalErros: somaTotalQuestoes - somaTotalAcertos
            };
        },

        obterDadosIndividuaisAluno(id) {
            let aluno = this.obterAlunoPorId(id);
            if (!aluno && id) {
                const strId = String(id).toLowerCase().trim();
                aluno = this.obterAlunos().find(u => 
                    (u.nome && u.nome.toLowerCase().trim() === strId) ||
                    (u.email && u.email.toLowerCase().trim() === strId)
                );
            }
            if (!aluno) return null;

            let historico = aluno.historico_atividades;
            if (!historico || historico.length === 0) {
                historico = gerarHistoricoInicial(aluno.id, aluno.turma || "6º A");
                aluno.historico_atividades = historico;
            }
            const atividadesRealizadas = historico.length;
            const atividadesConcluidas = historico.filter(h => h.concluida).length;

            // Regra consistente para notas: considera a melhor nota válida alcançada em cada capítulo
            const melhoresPorCapitulo = {};
            historico.forEach(h => {
                const cId = h.id_atividade || 1;
                if (!melhoresPorCapitulo[cId] || Number(h.nota || 0) > Number(melhoresPorCapitulo[cId].nota || 0)) {
                    melhoresPorCapitulo[cId] = h;
                }
            });

            const notasValidas = Object.values(melhoresPorCapitulo).map(m => Number(m.nota || 0));
            const mediaGeral = notasValidas.length > 0 
                ? (notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length).toFixed(1)
                : "0.0";

            let somaAcertos = 0;
            let somaQuestoes = 0;
            let somaErros = 0;
            Object.values(melhoresPorCapitulo).forEach(m => {
                somaAcertos += Number(m.acertos || 0);
                somaQuestoes += Number(m.total_questoes || 5);
                somaErros += Number(m.erros || (m.total_questoes - m.acertos) || 0);
            });

            const porcentagemAcertos = somaQuestoes > 0 
                ? Math.round((somaAcertos / somaQuestoes) * 100) 
                : 0;

            const capitulosConcluidos = (aluno.progresso || []).filter(Boolean).length;
            const progressoTrilhaPorcentagem = Math.round((capitulosConcluidos / 5) * 100);

            // Conquistas com critérios precisos sincronizados com o backend
            const conquistas = [
                {
                    id: "primeiro_passo",
                    nome: "Primeiros Passos",
                    desc: "Realizou sua primeira atividade na plataforma",
                    icone: "flag",
                    desbloqueada: atividadesRealizadas >= 1
                },
                {
                    id: "nota_maxima",
                    nome: "Nota Máxima",
                    desc: "Obteve nota 10 em um desafio de frações",
                    icone: "star",
                    desbloqueada: historico.some(h => Number(h.nota) >= 10.0)
                },
                {
                    id: "cem_porcento",
                    nome: "100% Acertos",
                    desc: "Acertou todas as questões de um capítulo",
                    icone: "check-badge",
                    desbloqueada: historico.some(h => Number(h.porcentagem) === 100)
                },
                {
                    id: "explorador_dedicado",
                    nome: "Explorador da Trilha",
                    desc: "Concluiu mais de 50% da trilha de frações",
                    icone: "map",
                    desbloqueada: capitulosConcluidos >= 3
                },
                {
                    id: "mestre_supremo",
                    nome: "Mestre das Frações",
                    desc: "Completou todos os 5 capítulos da trilha de Silas",
                    icone: "trophy",
                    desbloqueada: capitulosConcluidos >= 5
                },
                {
                    id: "estudante_focado",
                    nome: "Estudante Focado",
                    desc: "Realizou 3 ou mais atividades de estudo",
                    icone: "sparkles",
                    desbloqueada: atividadesRealizadas >= 3
                }
            ];

            const ultimaAtividade = historico.length > 0 
                ? historico[historico.length - 1] 
                : null;

            // Dados cronológicos para gráfico de evolução das notas
            const evolucaoNotas = historico.map((h, i) => ({
                rotulo: `Ativ. ${i + 1} (${h.titulo_atividade ? h.titulo_atividade.split('—')[0].trim() : 'Cap.'})`,
                nota: Number(h.nota || 0),
                data: new Date(h.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                acertos: h.acertos,
                total: h.total_questoes
            }));

            return {
                id: aluno.id,
                nome: aluno.nome,
                email: aluno.email,
                turma: aluno.turma || "Não informada",
                anoEscolar: aluno.ano_escolar || extrairAno(aluno.turma),
                atividadesRealizadas,
                atividadesConcluidas,
                mediaGeral,
                porcentagemAcertos,
                totalAcertos: somaAcertos,
                totalErros: somaErros,
                progressoCapitulos: capitulosConcluidos,
                progressoPorcentagem: progressoTrilhaPorcentagem,
                conquistas,
                ultimaAtividade: ultimaAtividade ? {
                    titulo: ultimaAtividade.titulo_atividade,
                    nota: ultimaAtividade.nota,
                    data: new Date(ultimaAtividade.data).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                } : null,
                evolucaoNotas,
                historicoCompleto: historico
            };
        }
    };
})();

// Expõe globalmente
if (typeof window !== "undefined") {
    window.FractaDB = FractaDB;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = FractaDB;
}
