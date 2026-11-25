var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (email == undefined || email.trim() === "") {
        res.status(400).send("O e-mail é obrigatório!");
    } else if (senha == undefined || senha.trim() === "") {
        res.status(400).send("A senha é obrigatória!");
    } else {
        usuarioModel.garantirPatentesPadrao()
            .then(function () {
                return usuarioModel.autenticar(email.trim(), senha);
            })
            .then(function (resultadoAutenticar) {
                console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);

                if (resultadoAutenticar.length == 1) {
                    res.json({
                        id: resultadoAutenticar[0].id,
                        nick: resultadoAutenticar[0].nick,
                        idJogo: resultadoAutenticar[0].idJogo,
                        email: resultadoAutenticar[0].email,
                        fkPatente: resultadoAutenticar[0].fkPatente,
                        nomePatente: resultadoAutenticar[0].nomePatente,
                        corPatente: resultadoAutenticar[0].corPatente
                    });
                } else if (resultadoAutenticar.length == 0) {
                    res.status(403).send("E-mail e/ou senha inválido(s)!");
                } else {
                    res.status(403).send("Mais de um usuário encontrado com as mesmas credenciais!");
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function cadastrar(req, res) {
    var nick = req.body.nickServer;
    var idJogo = req.body.idJogoServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    var regexIdJogo = /^\d{8}$/;
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nick == undefined || nick.trim().length < 3) {
        res.status(400).send("O Nick no jogo deve ter pelo menos 3 caracteres!");
    } else if (idJogo == undefined || !regexIdJogo.test(String(idJogo).trim())) {
        res.status(400).send("O ID do jogo deve conter exatos 8 números!");
    } else if (email == undefined || !regexEmail.test(email.trim())) {
        res.status(400).send("Informe um endereço de e-mail válido!");
    } else if (senha == undefined || senha.length < 6) {
        res.status(400).send("A senha deve ter no mínimo 6 caracteres!");
    } else {
        // Garante que as 9 patentes existam na tabela `patente` antes de inserir o usuário
        usuarioModel.garantirPatentesPadrao()
            .then(function () {
                return usuarioModel.cadastrar(nick.trim(), String(idJogo).trim(), email.trim(), senha);
            })
            .then(function (resultado) {
                res.status(201).json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("\nHouve um erro ao realizar o cadastro! Erro: ", erro.sqlMessage);
                if (erro.code === "ER_DUP_ENTRY") {
                    if (erro.sqlMessage && erro.sqlMessage.includes("id_jogo")) {
                        res.status(409).send("Este ID do jogo (8 dígitos) já está cadastrado!");
                    } else {
                        res.status(409).send("Este e-mail já está cadastrado!");
                    }
                } else {
                    res.status(500).send(erro.sqlMessage || "Erro interno ao cadastrar usuário.");
                }
            });
    }
}

function listarPatentes(req, res) {
    usuarioModel.garantirPatentesPadrao()
        .then(function () {
            return usuarioModel.listarPatentes();
        })
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function atualizarPatente(req, res) {
    var idUsuario = req.params.idUsuario;
    var fkPatente = req.body.fkPatenteServer;

    if (!idUsuario || !fkPatente) {
        res.status(400).send("Usuário ou patente inválidos!");
        return;
    }

    usuarioModel.garantirPatentesPadrao()
        .then(function () {
            return usuarioModel.atualizarPatente(idUsuario, fkPatente);
        })
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    autenticar,
    cadastrar,
    listarPatentes,
    atualizarPatente
};
