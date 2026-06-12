document.addEventListener("DOMContentLoaded", () => {
    const usuario = localStorage.getItem("usuario");
    if (!usuario && !window.location.pathname.includes("login.html") && !window.location.pathname.includes("cadastro.html")) {
        window.location.href = "templates/login.html";
        return;
    }

    // Função de mensagem profissional
    function showMessage(element, text, type) {
        const msg = document.createElement("div");
        msg.className = `mt-4 p-3 rounded-lg text-sm font-bold ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
        msg.innerText = text;
        element.after(msg);
        setTimeout(() => msg.remove(), 3000);
    }

    // Configuração de Avatares
    if (usuario) {
        const avatars = document.querySelectorAll("#avatarUsuario");
        avatars.forEach(a => a.innerText = usuario.charAt(0).toUpperCase());
        const nomeDisplay = document.querySelector("#nomeUsuario");
        if(nomeDisplay) nomeDisplay.innerText = usuario;
    }

    // Lógica de Login
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const user = document.querySelector("#nome").value;
            localStorage.setItem("usuario", user);
            window.location.href = "../index.html";
        });
    }

    // Lógica de Logout
    const btnSair = document.querySelectorAll(".btnSair");
    btnSair.forEach(b => b.addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "login.html";
    }));
});