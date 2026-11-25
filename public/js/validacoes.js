var timerMensagem = null;

function validarEmail(email) {
    if (!email) return false;
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(String(email).trim());
}

function validarIdJogo(idJogo) {
    if (!idJogo) return false;

    let idTexto = String(idJogo).trim();

    // Verifica se o ID possui exatos 8 dígitos
    if (idTexto.length !== 8) {
        return false;
    }

    // Laço de repetição for para verificar se cada caractere é um número de 0 a 9
    for (let i = 0; i < idTexto.length; i++) {
        let caractereAtual = idTexto[i];
        if (caractereAtual < "0" || caractereAtual > "9") {
            return false;
        }
    }

    return true;
}

function validarFormularioLogin(email, senha) {
    if (!email || email.trim() === "" || !senha || senha.trim() === "") {
        return {
            valido: false,
            mensagem: "Preencha todos os campos obrigatórios (E-mail e Senha)."
        };
    }

    if (!validarEmail(email)) {
        return {
            valido: false,
            mensagem: "Informe um endereço de e-mail válido (exemplo: agente@cops.gg)."
        };
    }

    if (senha.length < 6) {
        return {
            valido: false,
            mensagem: "A senha deve conter no mínimo 6 caracteres."
        };
    }

    return { valido: true, mensagem: "" };
}

function validarFormularioCadastro(nick, idJogo, email, senha, confirmacaoSenha) {
    if (
        !nick || nick.trim() === "" ||
        !idJogo || String(idJogo).trim() === "" ||
        !email || email.trim() === "" ||
        !senha || senha === "" ||
        !confirmacaoSenha || confirmacaoSenha === ""
    ) {
        return {
            valido: false,
            mensagem: "Todos os campos são obrigatórios! Verifique se nenhum campo ficou em branco."
        };
    }

    if (nick.trim().length < 3 || nick.trim().length > 30) {
        return {
            valido: false,
            mensagem: "O Nick no jogo deve ter entre 3 e 30 caracteres."
        };
    }

    if (!validarIdJogo(idJogo)) {
        return {
            valido: false,
            mensagem: "O ID do jogo deve conter exatos 8 números (apenas dígitos, ex: 48291037)."
        };
    }

    if (!validarEmail(email)) {
        return {
            valido: false,
            mensagem: "Informe um e-mail válido (exemplo: jogador@dominio.com)."
        };
    }

    if (senha.length < 6) {
        return {
            valido: false,
            mensagem: "A senha deve ter no mínimo 6 caracteres para sua segurança."
        };
    }

    if (senha !== confirmacaoSenha) {
        return {
            valido: false,
            mensagem: "A confirmação de senha não coincide com a senha digitada."
        };
    }

    return { valido: true, mensagem: "" };
}

function validarFormularioPartida(modoJogo, mapa, duracao, kills, mortes, resultado, dataPartida) {
    if (
        !modoJogo || !mapa ||
        duracao === "" || duracao === null ||
        kills === "" || kills === null ||
        mortes === "" || mortes === null ||
        !resultado || !dataPartida
    ) {
        return {
            valido: false,
            mensagem: "Preencha todos os campos da partida antes de registrar!"
        };
    }

    var duracaoNum = Number(duracao);
    var killsNum = Number(kills);
    var mortesNum = Number(mortes);

    if (isNaN(duracaoNum) || duracaoNum < 1 || duracaoNum > 300) {
        return {
            valido: false,
            mensagem: "A duração da partida deve ser entre 1 e 300 minutos."
        };
    }

    if (isNaN(killsNum) || killsNum < 0 || !Number.isInteger(killsNum)) {
        return {
            valido: false,
            mensagem: "O número de Kills deve ser um número inteiro maior ou igual a 0."
        };
    }

    if (isNaN(mortesNum) || mortesNum < 0 || !Number.isInteger(mortesNum)) {
        return {
            valido: false,
            mensagem: "O número de Mortes deve ser um número inteiro maior ou igual a 0."
        };
    }

    if (resultado !== "Vitoria" && resultado !== "Derrota") {
        return {
            valido: false,
            mensagem: "Selecione um resultado válido: Vitória ou Derrota."
        };
    }

    return { valido: true, mensagem: "" };
}

function exibirAlertaFormulario(mensagem, tipo) {
    var cardErro = document.getElementById("cardErro");
    var mensagemErro = document.getElementById("mensagem_erro");

    if (!cardErro || !mensagemErro) return;

    cardErro.classList.remove("sucesso", "erro");
    cardErro.classList.add(tipo === "sucesso" ? "sucesso" : "erro");
    cardErro.style.display = "block";
    mensagemErro.innerHTML = mensagem;

    if (timerMensagem) {
        clearTimeout(timerMensagem);
    }

    timerMensagem = setTimeout(function () {
        cardErro.style.display = "none";
    }, 5000);
}
