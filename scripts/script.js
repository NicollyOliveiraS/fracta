const API_URL =
    "https://backend-tcc-tv2u.vercel.app";

// Gerenciamento de Tema Escuro / Claro
function aplicarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark' || (!temaSalvo && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}
aplicarTema();

document.addEventListener("DOMContentLoaded", () => {
    aplicarTema();
    const btnTema = document.querySelectorAll("#themeToggle, .btnAlternarTema");
    btnTema.forEach((btn) => {
        btn.addEventListener("click", () => {
            const ehDark = document.documentElement.classList.toggle("dark");
            localStorage.setItem("tema", ehDark ? "dark" : "light");
        });
    });
    const estaEmTemplates =
        window.location.pathname.includes("/templates/");

    const caminho = (arquivo) =>
        estaEmTemplates
            ? arquivo
            : `templates/${arquivo}`;

    const paginaAtual =
        window.location.pathname.split("/").pop()
        || "index.html";

    const paginasPublicas = [
        "login.html",
        "cadastro.html",
        "esqueci-senha.html",
        "welcome.html",
        "boas-vindas.html",
        "boavinda.html"
    ];

    let usuario = null;

    try {
        usuario = JSON.parse(
            localStorage.getItem("usuario")
        );
    } catch {
        localStorage.removeItem("usuario");
    }

    const token = localStorage.getItem("token");

    if (
        (!usuario || !token) &&
        !paginasPublicas.includes(paginaAtual)
    ) {
        window.location.href =
            caminho("login.html");

        return;
    }

    function exibirMensagem(
        seletor,
        texto,
        tipo = "erro"
    ) {
        const elemento =
            document.querySelector(seletor);

        if (!elemento) return;

        elemento.textContent = texto;

        elemento.classList.remove(
            "hidden",
            "text-red-700",
            "text-green-700"
        );

        elemento.classList.add(
            tipo === "sucesso"
                ? "text-green-700"
                : "text-red-700"
        );
    }

    function paginaInicial(tipoUsuario) {
        const destinos = {
            admin: "adm.html",
            aluno: null
        };

        const destino = destinos[tipoUsuario];

        if (!destino) {
            return estaEmTemplates
                ? "../index.html"
                : "index.html";
        }

        return caminho(destino);
    }

    if (usuario && typeof usuario === "object") {
        const nomeUsuario =
            typeof usuario.nome === "string" && usuario.nome.trim()
                ? usuario.nome.trim()
                : "Usuário";

        document
            .querySelectorAll("#avatarUsuario")
            .forEach((avatar) => {
                avatar.textContent =
                    nomeUsuario
                        .charAt(0)
                        .toUpperCase();
            });

        const nomeDisplay =
            document.querySelector("#nomeUsuario");

        if (nomeDisplay) {
            nomeDisplay.textContent =
                nomeUsuario;
        }

        const nomeHeader =
            document.querySelector("#nomeUsuarioHeader");

        if (nomeHeader) {
            nomeHeader.textContent = nomeUsuario;
        }

        const tipoUsuario =
            document.querySelector(
                "#tipoUsuarioHeader, #nomeUsuarioHeader + p"
            );

        if (tipoUsuario) {
            tipoUsuario.textContent =
                usuario.tipo_usuario === "professor"
                    ? "Professor"
                    : usuario.tipo_usuario === "admin"
                        ? "Administrador"
                        : "Estudante";
        }
    }

    const loginForm =
        document.querySelector("#loginForm");

    if (loginForm) {
        loginForm.addEventListener(
            "submit",
            async (evento) => {
                evento.preventDefault();

                const email = document
                    .querySelector("#email")
                    .value
                    .trim();

                const senha = document
                    .querySelector("#senha")
                    .value;

                const botao =
                    document.querySelector(
                        "#btnEntrar"
                    ) ||
                    loginForm.querySelector(
                        'button[type="submit"]'
                    );

                botao.disabled = true;
                botao.textContent = "Entrando...";

                try {
                    const resposta = await fetch(
                        `${API_URL}/login`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                email,
                                senha
                            })
                        }
                    );

                    const dados =
                        await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            dados.erro ||
                            "Não foi possível entrar"
                        );
                    }

                    localStorage.setItem(
                        "token",
                        dados.token
                    );

                    localStorage.setItem(
                        "usuario",
                        JSON.stringify(
                            dados.usuario
                        )
                    );

                    window.location.href =
                        paginaInicial(
                            dados.usuario
                                .tipo_usuario
                        );
                } catch (erro) {
                    exibirMensagem(
                        "#mensagemLogin",
                        erro instanceof TypeError
                            ? "Não foi possível conectar ao servidor."
                            : erro.message
                    );
                } finally {
                    botao.disabled = false;
                    botao.textContent = "Entrar";
                }
            }
        );
    }

    const cadastroForm =
        document.querySelector("#cadastroForm");

    if (cadastroForm) {
        cadastroForm.addEventListener(
            "submit",
            async (evento) => {
                evento.preventDefault();

                const nome = document
                    .querySelector("#cadNome")
                    .value
                    .trim();

                const email = document
                    .querySelector("#cadEmail")
                    .value
                    .trim();

                const tipoUsuario = document
                    .querySelector("#tipoUsuario")
                    .value;

                const senha = document
                    .querySelector("#cadSenha")
                    .value;

                const confirmarSenha = document
                    .querySelector(
                        "#confirmarSenha"
                    )
                    .value;

                const botao =
                    document.querySelector(
                        "#btnCadastrar"
                    );

                if (senha.length < 6) {
                    exibirMensagem(
                        "#mensagemCadastro",
                        "A senha deve ter pelo menos 6 caracteres."
                    );

                    return;
                }

                if (senha !== confirmarSenha) {
                    exibirMensagem(
                        "#mensagemCadastro",
                        "As senhas não são iguais."
                    );

                    return;
                }

                botao.disabled = true;
                botao.textContent =
                    "Cadastrando...";

                try {
                    const resposta = await fetch(
                        `${API_URL}/usuarios`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                nome,
                                email,
                                senha,
                                tipo_usuario:
                                    tipoUsuario
                            })
                        }
                    );

                    const dados =
                        await resposta.json();

                    if (!resposta.ok) {
                        throw new Error(
                            dados.erro ||
                            "Não foi possível cadastrar"
                        );
                    }

                    exibirMensagem(
                        "#mensagemCadastro",
                        "Cadastro realizado! Redirecionando para o login...",
                        "sucesso"
                    );

                    cadastroForm.reset();

                    setTimeout(() => {
                        window.location.href =
                            "login.html";
                    }, 1500);
                } catch (erro) {
                    exibirMensagem(
                        "#mensagemCadastro",
                        erro instanceof TypeError
                            ? "Não foi possível conectar ao servidor."
                            : erro.message
                    );
                } finally {
                    botao.disabled = false;
                    botao.textContent =
                        "Cadastrar";
                }
            }
        );
    }

    document
        .querySelectorAll(".btnSair")
        .forEach((botao) => {
            botao.addEventListener(
                "click",
                () => {
                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "usuario"
                    );

                    window.location.href =
                        caminho("login.html");
                }
            );
        });
});