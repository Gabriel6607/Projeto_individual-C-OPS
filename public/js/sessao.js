// Gerenciamento de Sessão do Usuário - C-Ops Time Tracker
function validarSessao() {
    var email = sessionStorage.EMAIL_USUARIO;
    var nick = sessionStorage.NICK_USUARIO || sessionStorage.NOME_USUARIO;
    var idJogo = sessionStorage.ID_JOGO;
    var idUsuario = sessionStorage.ID_USUARIO;

    var b_usuario = document.getElementById("b_usuario");
    var b_id_jogo = document.getElementById("b_id_jogo");

    if (email != null && nick != null && idUsuario != null) {
        if (b_usuario) {
            b_usuario.innerHTML = nick;
        }
        if (b_id_jogo && idJogo) {
            b_id_jogo.innerHTML = "#" + idJogo;
        }
        return true;
    } else {
        window.location = "../login.html";
        return false;
    }
}

function limparSessao() {
    sessionStorage.clear();
    window.location = "../login.html";
}

function aguardar() {
    var divAguardar = document.getElementById("div_aguardar");
    if (divAguardar) {
        divAguardar.style.display = "flex";
    }
}

function finalizarAguardar(texto) {
    var divAguardar = document.getElementById("div_aguardar");
    if (divAguardar) {
        divAguardar.style.display = "none";
    }

    var divErrosLogin = document.getElementById("div_erros_login");
    if (divErrosLogin && texto) {
        divErrosLogin.style.display = "flex";
        divErrosLogin.innerHTML = texto;
    }
}
