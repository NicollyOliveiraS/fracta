// ==========================================
// FRACTA - script.js
// Universal Path & Business Logic Handler
// (Polished with Non-overlapping DOM Notifications)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Path Helper & Configuration
    const isTemplate = window.location.pathname.includes("/templates/");
    const loginPage = isTemplate ? "login.html" : "templates/login.html";
    const dashboardPage = isTemplate ? "../index.html" : "index.html";

    // 2. Authentication Guard
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes("login.html") || 
                       currentPath.includes("cadastro.html") || 
                       currentPath.includes("esqueci-senha.html");
    
    const usuario = localStorage.getItem("usuario");

    if (!usuario && !isAuthPage) {
        window.location.href = loginPage;
        return;
    }

    // 3. Helper Functions for Inline Alerts/Feedback
    function showFormMessage(formElement, message, type) {
        // Find or create message box in the form's parent container (between Title and Form)
        const parent = formElement.parentElement;
        let msgBox = parent.querySelector(".form-message-box");
        if (!msgBox) {
            msgBox = document.createElement("div");
            msgBox.className = "form-message-box transition-all duration-300 transform scale-95 opacity-0";
            parent.insertBefore(msgBox, formElement);
        }
        
        // Style based on success or error (using margin-bottom to push the form down cleanly)
        if (type === "error") {
            msgBox.className = "form-message-box bg-rose-100 border border-rose-300 text-rose-800 px-4 py-3 rounded-xl mb-6 text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform scale-100 opacity-100 animate-pulse";
            msgBox.innerHTML = `⚠️ <span>${message}</span>`;
        } else {
            msgBox.className = "form-message-box bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl mb-6 text-sm font-semibold text-center flex items-center justify-center gap-2 shadow-sm transition-all duration-300 transform scale-100 opacity-100";
            msgBox.innerHTML = `🎉 <span>${message}</span>`;
        }
    }

    function showChallengeFeedback(btnElement, message, isCorrect) {
        const parent = btnElement.parentElement;
        let feedbackBox = parent.querySelector(".challenge-feedback");
        if (!feedbackBox) {
            feedbackBox = document.createElement("div");
            feedbackBox.className = "challenge-feedback mt-6 p-4 rounded-xl text-center font-medium shadow-sm transition-all duration-300 transform scale-95 opacity-0";
            btnElement.after(feedbackBox); // Insert directly after the Responder button
        }
        
        if (isCorrect) {
            feedbackBox.className = "challenge-feedback mt-6 p-4 rounded-xl text-center font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-sm transition-all duration-300 transform scale-100 opacity-100 flex items-center justify-center gap-2";
            feedbackBox.innerHTML = `🎉 <span>${message}</span>`;
        } else {
            feedbackBox.className = "challenge-feedback mt-6 p-4 rounded-xl text-center font-semibold text-rose-800 bg-rose-100 border border-rose-300 shadow-sm transition-all duration-300 transform scale-100 opacity-100 flex items-center justify-center gap-2";
            feedbackBox.innerHTML = `💡 <span>${message}</span>`;
        }
    }

    function showActivityFeedback(btnElement, message, isCorrect) {
        const footer = btnElement.parentElement;
        let feedbackBox = footer.parentElement.querySelector(".activity-feedback");
        if (!feedbackBox) {
            feedbackBox = document.createElement("div");
            feedbackBox.className = "activity-feedback mb-6 p-4 rounded-xl text-center font-medium shadow-sm transition-all duration-300 transform scale-95 opacity-0";
            footer.before(feedbackBox); // Insert directly above the footer navigation buttons
        }
        
        if (isCorrect) {
            feedbackBox.className = "activity-feedback mb-6 p-4 rounded-xl text-center font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 shadow-sm transition-all duration-300 transform scale-100 opacity-100 flex items-center justify-center gap-2";
            feedbackBox.innerHTML = `🎉 <span>${message}</span>`;
        } else {
            feedbackBox.className = "activity-feedback mb-6 p-4 rounded-xl text-center font-semibold text-rose-800 bg-rose-100 border border-rose-300 shadow-sm transition-all duration-300 transform scale-100 opacity-100 flex items-center justify-center gap-2";
            feedbackBox.innerHTML = `💡 <span>${message}</span>`;
        }
    }

    // 4. Dynamic User Greetings and Avatar Initials
    if (usuario) {
        // Set dynamic name in dashboard/greetings
        const nomeUsuario = document.querySelector("#nomeUsuario");
        if (nomeUsuario) {
            nomeUsuario.textContent = usuario;
        }

        // Set dynamic name in profile page
        const nomeUsuarioConta = document.querySelector("#nomeUsuarioConta");
        if (nomeUsuarioConta) {
            nomeUsuarioConta.textContent = usuario;
        }

        // Set dynamic initials in all header profile circles
        const avatars = document.querySelectorAll("#avatarUsuario");
        const initial = usuario.charAt(0).toUpperCase();
        avatars.forEach(avatar => {
            avatar.textContent = initial;
            avatar.classList.add("font-bold", "text-white");
        });
    }

    // =============================
    // LOGIN FORM
    // =============================
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const userVal = document.querySelector("#nome").value.trim();
            const senhaVal = document.querySelector("#senha").value;

            if (!userVal || !senhaVal) {
                showFormMessage(loginForm, "Preencha todos os campos.", "error");
                return;
            }

            // Verify credentials
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const contaExistente = usuarios.find(u => u.user === userVal && u.senha === senhaVal);

            if (contaExistente) {
                localStorage.setItem("usuario", contaExistente.nome);
                showFormMessage(loginForm, "Entrando...", "success");
                setTimeout(() => {
                    window.location.href = dashboardPage;
                }, 1200);
            } else {
                // If not found, login anyway as fallback, saving it for ease of use
                localStorage.setItem("usuario", userVal);
                usuarios.push({ nome: userVal, user: userVal, senha: senhaVal });
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
                
                showFormMessage(loginForm, "Conta criada e login realizado!", "success");
                setTimeout(() => {
                    window.location.href = dashboardPage;
                }, 1200);
            }
        });
    }

    // =============================
    // CADASTRO FORM
    // =============================
    const cadastroForm = document.querySelector("#cadastroForm");
    if (cadastroForm) {
        cadastroForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const nome = document.querySelector("#cadNome").value.trim();
            const user = document.querySelector("#cadUser").value.trim();
            const senha = document.querySelector("#cadSenha").value;
            const confirmar = document.querySelector("#confirmarSenha").value;

            if (!nome || !user || !senha || !confirmar) {
                showFormMessage(cadastroForm, "Preencha todos os campos.", "error");
                return;
            }

            if (senha !== confirmar) {
                showFormMessage(cadastroForm, "As senhas não coincidem.", "error");
                return;
            }

            // Save user
            const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            if (usuarios.some(u => u.user === user)) {
                showFormMessage(cadastroForm, "Este nome de usuário já existe.", "error");
                return;
            }

            usuarios.push({ nome, user, senha });
            localStorage.setItem("usuarios", JSON.stringify(usuarios));
            localStorage.setItem("usuario", nome); // Auto login

            showFormMessage(cadastroForm, "Cadastro realizado com sucesso! Carregando...", "success");
            setTimeout(() => {
                window.location.href = loginPage;
            }, 1200);
        });
    }

    // =============================
    // RECUPERAR SENHA FORM
    // =============================
    const recuperarForm = document.querySelector("#recuperarForm");
    if (recuperarForm) {
        recuperarForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const user = document.querySelector("#recuperarUser").value.trim();
            const novaSenha = document.querySelector("#novaSenha").value;

            if (!user || !novaSenha) {
                showFormMessage(recuperarForm, "Preencha todos os campos.", "error");
                return;
            }

            let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
            const index = usuarios.findIndex(u => u.user === user);

            if (index !== -1) {
                usuarios[index].senha = novaSenha;
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
                showFormMessage(recuperarForm, "Senha redefinida com sucesso! Redirecionando...", "success");
                setTimeout(() => {
                    window.location.href = loginPage;
                }, 1200);
            } else {
                usuarios.push({ nome: user, user: user, senha: novaSenha });
                localStorage.setItem("usuarios", JSON.stringify(usuarios));
                showFormMessage(recuperarForm, "Usuário não encontrado. Nova conta registrada!", "success");
                setTimeout(() => {
                    window.location.href = loginPage;
                }, 1200);
            }
        });
    }

    // =============================
    // LOGOUT (SAIR)
    // =============================
    const botoesSair = document.querySelectorAll(".btnSair");
    botoesSair.forEach(botao => {
        botao.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuario");
            window.location.href = loginPage;
        });
    });

    // =============================
    // DESAFIO DO DIA (INTERATIVO)
    // =============================
    const opcoesDesafio = document.querySelectorAll(".opcao-fracao");
    let respostaDesafioSelecionada = null;

    opcoesDesafio.forEach(botao => {
        botao.addEventListener("click", () => {
            opcoesDesafio.forEach(item => {
                item.classList.remove("border-orange-600", "bg-orange-100");
                item.classList.add("border-transparent", "bg-[#f7f0e4]");
            });

            botao.classList.remove("border-transparent", "bg-[#f7f0e4]");
            botao.classList.add("border-orange-600", "bg-orange-100");

            respostaDesafioSelecionada = botao.getAttribute("data-valor") || botao.textContent.trim();
        });
    });

    const btnResponder = document.querySelector("#btnResponder");
    if (btnResponder) {
        btnResponder.addEventListener("click", () => {
            if (!respostaDesafioSelecionada) {
                // Show warning directly under Responder button
                showChallengeFeedback(btnResponder, "Por favor, escolha uma resposta antes de responder!", false);
                return;
            }

            // Math equivalence check
            if (respostaDesafioSelecionada === "1/2" || 
                respostaDesafioSelecionada === "3/6" || 
                respostaDesafioSelecionada === "4/8") {
                showChallengeFeedback(btnResponder, "Parabéns! Resposta correta! 🎉 As frações 1/2, 3/6 e 4/8 são todas equivalentes a 2/4!", true);
            } else {
                showChallengeFeedback(btnResponder, "Resposta incorreta. Tente analisar a equivalência de novo! 💡", false);
            }
        });
    }

    // =============================
    // ATIVIDADE DIAGNÓSTICA
    // =============================
    const opcoesAtividade = document.querySelectorAll(".opcao-atividade");
    let respostaAtividadeSelecionada = null;

    opcoesAtividade.forEach(botao => {
        botao.addEventListener("click", () => {
            opcoesAtividade.forEach(item => {
                item.classList.remove("border-orange-500", "bg-orange-100");
                item.classList.add("border-transparent", "bg-[#f3f4f6]");
            });

            botao.classList.remove("border-transparent", "bg-[#f3f4f6]");
            botao.classList.add("border-orange-500", "bg-orange-100");

            respostaAtividadeSelecionada = botao.getAttribute("data-valor");
        });
    });

    const btnProximo = document.querySelector("#btnProximo");
    if (btnProximo) {
        btnProximo.addEventListener("click", () => {
            if (!respostaAtividadeSelecionada) {
                showActivityFeedback(btnProximo, "Por favor, selecione uma opção para responder!", false);
                return;
            }

            if (respostaAtividadeSelecionada === "7/8") {
                showActivityFeedback(btnProximo, "Parabéns, você acertou! 🌟 Redirecionando para o painel...", true);
                
                // Save progress
                let progresso = JSON.parse(localStorage.getItem("progressoAtividades") || "[]");
                if (!progresso.includes("diagnostica")) {
                    progresso.push("diagnostica");
                    localStorage.setItem("progressoAtividades", JSON.stringify(progresso));
                }

                // Redirect after brief delay
                setTimeout(() => {
                    window.location.href = dashboardPage;
                }, 1500);
            } else {
                showActivityFeedback(btnProximo, "Resposta incorreta. Dica: conte quantas partes laranjas estão pintadas (7) de um total de fatias (8)! 💡", false);
            }
        });
    }
});
