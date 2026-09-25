/**
 * FRACTA Database & State Management Layer
 * Gerencia persistência de turmas, alunos, notas, progresso, atividades e métricas.
 * Mantém sincronização com a API e garante compatibilidade com dados existentes.
 */

const FractaDB = (() => {
    const API_URL = "https://backend-tcc-tv2u.vercel.app";
    const STORAGE_KEY_USUARIOS = "fracta_db_usuarios_v2";
    const STORAGE_KEY_ATIVIDADES = "fracta_db_atividades_v2";

    const TURMAS_DISPONIVEIS = ["6º A", "6º B", "7º A", "7º B"];

    function extrairAno(turma) {
        if (!turma) return "6º ano";
        return turma.includes("7") ? "7º ano" : "6º ano";
    }

    // Inicializa o banco local com base no cache e sincroniza com a API remota
    async function sincronizarComAPI() {
        let usuariosLocais = carregarUsuariosLocais();

        try {
            const resp = await fetch(`${API_URL}/usuarios`, {
                headers: { "Content-Type": "application/json" }
            });

            if (resp.ok) {
                const usuariosRemotos = await resp.json();
                if (Array.isArray(usuariosRemotos)) {
                    // Mescla usuários remotos preservando metadados locais (turma, histórico, notas)
                    const mapaPorEmailOuId = new Map();
                    usuariosLocais.forEach(u => {
                        const chave = (u.email || "").toLowerCase().trim() || String(u.id);
                        mapaPorEmailOuId.set(chave, u);
                    });

                    // Lista de turmas para distribuição equilibrada dos alunos antigos sem turma
                    const turmasPadrao = ["6º A", "6º B", "7º A", "7º B"];
                    let idxTurma = 0;

                    const usuariosAtualizados = usuariosRemotos.map((remoto, i) => {
                        const chave = (remoto.email || "").toLowerCase().trim() || String(remoto.id);
                        const local = mapaPorEmailOuId.get(chave) || {};

                        const ehAluno = (remoto.tipo_usuario || local.tipo_usuario || "aluno") === "aluno";
                        let turma = local.turma || remoto.turma || null;

                        // Se é aluno e ainda não tem turma atribuída, atribui deterministicamente para compatibilidade
                        if (ehAluno && !turma) {
                            turma = turmasPadrao[(remoto.id || i) % turmasPadrao.length];
                        }

                        const anoEscolar = ehAluno ? extrairAno(turma) : null;

                        return {
                            id: remoto.id || local.id || (100 + i),
                            nome: remoto.nome || local.nome || "Usuário",
                            email: remoto.email || local.email || "",
                            tipo_usuario: remoto.tipo_usuario || local.tipo_usuario || "aluno",
                            turma: turma,
                            ano_escolar: anoEscolar,
                            data_cadastro: remoto.data_cadastro || local.data_cadastro || new Date().toISOString(),
                            historico_atividades: local.historico_atividades || gerarHistoricoInicial(remoto.id, turma),
                            progresso: local.progresso || [false, false, false, false, false]
                        };
                    });

                    // Adiciona também usuários criados localmente que ainda não estejam na lista remota
                    usuariosLocais.forEach(uLocal => {
                        const chave = (uLocal.email || "").toLowerCase().trim() || String(uLocal.id);
                        const existe = usuariosAtualizados.some(u => 
                            ((u.email || "").toLowerCase().trim() || String(u.id)) === chave
                        );
                        if (!existe) {
                            usuariosAtualizados.push(uLocal);
                        }
                    });

                    salvarUsuariosLocais(usuariosAtualizados);
                    return usuariosAtualizados;
                }
            }
        } catch (e) {
            console.warn("FractaDB: API remota indisponível, utilizando dados locais persistidos.", e);
        }

        if (usuariosLocais.length === 0) {
            usuariosLocais = carregarBasePadrao();
            salvarUsuariosLocais(usuariosLocais);
        }

        return usuariosLocais;
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

    function carregarBasePadrao() {
        return [
            {
                id: 2,
                nome: "Pedro",
                email: "pedro@gmail.com",
                tipo_usuario: "professor",
                turma: null,
                ano_escolar: null,
                data_cadastro: "2026-05-29T18:24:01.306Z",
                historico_atividades: [],
                progresso: [true, true, true, true, true]
            },
            {
                id: 10,
                nome: "Beatriz Sousa de Andrade",
                email: "beatriz.hater@yahoo.com",
                tipo_usuario: "aluno",
                turma: "6º A",
                ano_escolar: "6º ano",
                data_cadastro: "2026-08-28T18:41:12.524Z",
                historico_atividades: gerarHistoricoInicial(10, "6º A"),
                progresso: [true, true, false, false, false]
            },
            {
                id: 11,
                nome: "Nicolly",
                email: "nicolly.oliveira@gmail.com",
                tipo_usuario: "aluno",
                turma: "6º B",
                ano_escolar: "6º ano",
                data_cadastro: "2026-09-05T18:29:31.182Z",
                historico_atividades: gerarHistoricoInicial(11, "6º B"),
                progresso: [true, true, true, false, false]
            },
            {
                id: 12,
                nome: "Nicolly Oliveira",
                email: "nicolly.oliveira.senai1@gmail.com",
                tipo_usuario: "aluno",
                turma: "7º A",
                ano_escolar: "7º ano",
                data_cadastro: "2026-09-18T16:43:31.648Z",
                historico_atividades: gerarHistoricoInicial(12, "7º A"),
                progresso: [true, true, true, true, false]
            },
            {
                id: 14,
                nome: "Nicolly Oliveira Santos",
                email: "nicolly.santos8@portalsesisp.org",
                tipo_usuario: "aluno",
                turma: "7º B",
                ano_escolar: "7º ano",
                data_cadastro: "2026-09-18T18:04:43.210Z",
                historico_atividades: gerarHistoricoInicial(14, "7º B"),
                progresso: [true, true, false, false, false]
            }
        ];
    }

    return {
        TURMAS: TURMAS_DISPONIVEIS,

        extrairAno,

        async init() {
            return await sincronizarComAPI();
        },

        obterUsuarios() {
            let u = carregarUsuariosLocais();
            if (!u || u.length === 0) {
                u = carregarBasePadrao();
                salvarUsuariosLocais(u);
            }
            return u;
        },

        obterAlunos() {
            return this.obterUsuarios().filter(u => u.tipo_usuario === "aluno");
        },

        obterAlunoPorId(id) {
            const numId = Number(id);
            return this.obterAlunos().find(u => u.id === numId || String(u.id) === String(id));
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

        cadastrarUsuario({ nome, email, senha, tipo_usuario, turma }) {
            const usuarios = this.obterUsuarios();
            const emailLimpo = (email || "").toLowerCase().trim();

            const jaExiste = usuarios.some(u => (u.email || "").toLowerCase().trim() === emailLimpo);
            if (jaExiste) {
                throw new Error("Este e-mail já está cadastrado.");
            }

            const ehAluno = tipo_usuario === "aluno";
            if (ehAluno && (!turma || !TURMAS_DISPONIVEIS.includes(turma))) {
                throw new Error("Por favor, selecione uma turma válida (6º A, 6º B, 7º A ou 7º B).");
            }

            const novoId = Date.now();
            const novoUsuario = {
                id: novoId,
                nome: nome.trim(),
                email: emailLimpo,
                tipo_usuario: tipo_usuario,
                turma: ehAluno ? turma : null,
                ano_escolar: ehAluno ? extrairAno(turma) : null,
                data_cadastro: new Date().toISOString(),
                historico_atividades: [],
                progresso: [false, false, false, false, false]
            };

            usuarios.push(novoUsuario);
            salvarUsuariosLocais(usuarios);

            return novoUsuario;
        },

        atualizarTurmaAluno(id, novaTurma) {
            const usuarios = this.obterUsuarios();
            const idx = usuarios.findIndex(u => u.id === Number(id) || String(u.id) === String(id));
            if (idx !== -1) {
                usuarios[idx].turma = novaTurma;
                usuarios[idx].ano_escolar = extrairAno(novaTurma);
                salvarUsuariosLocais(usuarios);
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
            const concluida = params.concluida !== undefined ? Boolean(params.concluida) : (porcentagem >= 85);

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

            if (concluida && capIdx >= 0 && capIdx < 5) {
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
                localStorage.setItem("usuario", JSON.stringify(s));
            } catch (e) {}

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
            const aluno = this.obterAlunoPorId(id);
            if (!aluno) return null;

            const historico = aluno.historico_atividades || [];
            const atividadesRealizadas = historico.length;
            const atividadesConcluidas = historico.filter(h => h.concluida).length;

            let somaNotas = 0;
            let somaAcertos = 0;
            let somaQuestoes = 0;
            let somaErros = 0;

            historico.forEach(h => {
                somaNotas += Number(h.nota || 0);
                somaAcertos += Number(h.acertos || 0);
                somaQuestoes += Number(h.total_questoes || 5);
                somaErros += Number(h.erros || (h.total_questoes - h.acertos) || 0);
            });

            const mediaGeral = atividadesRealizadas > 0 
                ? (somaNotas / atividadesRealizadas).toFixed(1) 
                : "0.0";

            const porcentagemAcertos = somaQuestoes > 0 
                ? Math.round((somaAcertos / somaQuestoes) * 100) 
                : 0;

            const capitulosConcluidos = (aluno.progresso || []).filter(Boolean).length;
            const progressoTrilhaPorcentagem = Math.round((capitulosConcluidos / 5) * 100);

            // Conquistas
            const conquistas = [];
            if (atividadesRealizadas >= 1) conquistas.push({ nome: "Primeiro Passo", desc: "Realizou a primeira atividade na plataforma" });
            if (historico.some(h => h.nota === 10)) conquistas.push({ nome: "Gênio das Frações", desc: "Obteve nota máxima (10) em um desafio" });
            if (capitulosConcluidos >= 3) conquistas.push({ nome: "Explorador Dedicado", desc: "Concluiu mais de 50% da trilha de Silas" });
            if (capitulosConcluidos === 5) conquistas.push({ nome: "Mestre Supremo das Frações", desc: "Completou todos os 5 capítulos da trilha" });
            if (porcentagemAcertos >= 90 && atividadesRealizadas >= 2) conquistas.push({ nome: "Precisão Cirúrgica", desc: "Taxa de acertos superior a 90%" });

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
