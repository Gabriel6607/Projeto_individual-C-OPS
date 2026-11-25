// ============================================================================
// AUTENTICAÇÃO E CADASTRO - C-OPS TIME TRACKER
// ============================================================================

function formatarInputIdJogo(input) {
    input.value = input.value.replace(/\D/g, "").slice(0, 8);
    var contador = document.getElementById("contador_id_jogo");
    if (contador) {
        var len = input.value.length;
        contador.innerHTML = len + "/8 dígitos";
        contador.style.color = len === 8 ? "#10b981" : "#94a3b8";
    }
}

function entrar() {
    var emailInput = document.getElementById("email_input");
    var senhaInput = document.getElementById("senha_input");

    var emailVar = emailInput ? emailInput.value.trim() : "";
    var senhaVar = senhaInput ? senhaInput.value : "";

    var validacao = validarFormularioLogin(emailVar, senhaVar);
    if (!validacao.valido) {
        exibirAlertaFormulario(validacao.mensagem, "erro");
        finalizarAguardar();
        return false;
    }

    aguardar();

    fetch("/usuarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            emailServer: emailVar,
            senhaServer: senhaVar
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (json) {
                    sessionStorage.EMAIL_USUARIO = json.email;
                    sessionStorage.NICK_USUARIO = json.nick;
                    sessionStorage.NOME_USUARIO = json.nick;
                    sessionStorage.ID_JOGO = json.idJogo;
                    sessionStorage.ID_USUARIO = json.id;
                    sessionStorage.FK_PATENTE = json.fkPatente;
                    sessionStorage.NOME_PATENTE = json.nomePatente;

                    exibirAlertaFormulario("Login realizado com sucesso! Entrando...", "sucesso");

                    setTimeout(function () {
                        window.location = "./dashboard/dashboard.html";
                    }, 900);
                });
            } else {
                resposta.text().then(function (texto) {
                    exibirAlertaFormulario(texto || "E-mail ou senha inválidos!", "erro");
                    finalizarAguardar(texto);
                });
            }
        })
        .catch(function (erro) {
            console.error(erro);
            exibirAlertaFormulario("Não foi possível conectar ao servidor. Tente novamente.", "erro");
            finalizarAguardar();
        });

    return false;
}

function cadastrar() {
    var nickVar = document.getElementById("nick_input").value.trim();
    var idJogoVar = document.getElementById("id_jogo_input").value.trim();
    var emailVar = document.getElementById("email_input").value.trim();
    var senhaVar = document.getElementById("senha_input").value;
    var confirmacaoSenhaVar = document.getElementById("confirmacao_senha_input").value;

    var validacao = validarFormularioCadastro(
        nickVar,
        idJogoVar,
        emailVar,
        senhaVar,
        confirmacaoSenhaVar
    );

    if (!validacao.valido) {
        exibirAlertaFormulario(validacao.mensagem, "erro");
        finalizarAguardar();
        return false;
    }

    aguardar();

    fetch("/usuarios/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickServer: nickVar,
            idJogoServer: idJogoVar,
            emailServer: emailVar,
            senhaServer: senhaVar
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirAlertaFormulario(
                    "Conta criada com sucesso! Indo para a tela de Login...",
                    "sucesso"
                );

                document.getElementById("nick_input").value = "";
                document.getElementById("id_jogo_input").value = "";
                document.getElementById("email_input").value = "";
                document.getElementById("senha_input").value = "";
                document.getElementById("confirmacao_senha_input").value = "";

                finalizarAguardar();

                setTimeout(function () {
                    window.location = "login.html";
                }, 1800);
            } else {
                resposta.text().then(function (textoErro) {
                    exibirAlertaFormulario(
                        textoErro || "Não foi possível concluir o cadastro.",
                        "erro"
                    );
                    finalizarAguardar();
                });
            }
        })
        .catch(function (erro) {
            console.error("#ERRO:", erro);
            exibirAlertaFormulario("Falha ao conectar com o servidor.", "erro");
            finalizarAguardar();
        });

    return false;
}
