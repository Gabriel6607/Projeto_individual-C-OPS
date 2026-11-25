var partidaModel = require("../models/partidaModel");
var usuarioModel = require("../models/usuarioModel");

// Calcula a patente sugerida do Critical Ops com base no KD, Win Rate e número de partidas
function calcularPatenteSugerida(kd, winRate, totalPartidas) {
    if (!totalPartidas || totalPartidas === 0) {
        return { id: 1, nome: "Iron", cor: "#71717a" };
    }

    var score = (Number(kd) * 50) + (Number(winRate) * 0.6);

    if (score >= 145 && totalPartidas >= 5) return { id: 9, nome: "Elite Ops", cor: "#ef4444" };
    if (score >= 130 && totalPartidas >= 4) return { id: 8, nome: "Spec Ops", cor: "#f97316" };
    if (score >= 115 && totalPartidas >= 3) return { id: 7, nome: "Master", cor: "#a855f7" };
    if (score >= 102) return { id: 6, nome: "Diamond", cor: "#3b82f6" };
    if (score >= 90) return { id: 5, nome: "Platinum", cor: "#06b6d4" };
    if (score >= 78) return { id: 4, nome: "Gold", cor: "#eab308" };
    if (score >= 65) return { id: 3, nome: "Silver", cor: "#94a3b8" };
    if (score >= 52) return { id: 2, nome: "Bronze", cor: "#b45309" };
    return { id: 1, nome: "Iron", cor: "#71717a" };
}

function registrarPartida(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var modoJogo = req.body.modoJogoServer || "Ranked Defuse";
    var mapa = req.body.mapaServer || "Plaza";
    var duracaoMinutos = Number(req.body.duracaoMinutosServer);
    var kills = Number(req.body.killsServer);
    var mortes = Number(req.body.mortesServer);
    var resultado = req.body.resultadoServer;
    var dataPartida = req.body.dataPartidaServer;
    var atualizarPatenteAuto = req.body.atualizarPatenteAutoServer !== false;

    if (!fkUsuario) {
        res.status(400).send("ID do usuário não informado!");
    } else if (!duracaoMinutos || duracaoMinutos <= 0 || duracaoMinutos > 300) {
        res.status(400).send("A duração da partida deve ser entre 1 e 300 minutos!");
    } else if (isNaN(kills) || kills < 0) {
        res.status(400).send("A quantidade de Kills deve ser um número válido (>= 0)!");
    } else if (isNaN(mortes) || mortes < 0) {
        res.status(400).send("A quantidade de Mortes deve ser um número válido (>= 0)!");
    } else if (resultado !== "Vitoria" && resultado !== "Derrota") {
        res.status(400).send("O resultado da partida deve ser 'Vitoria' ou 'Derrota'!");
    } else {
        var dataFormatadaSql = dataPartida
            ? dataPartida.replace("T", " ")
            : new Date().toISOString().slice(0, 19).replace("T", " ");

        partidaModel.registrarPartida(
            fkUsuario,
            modoJogo,
            mapa,
            duracaoMinutos,
            kills,
            mortes,
            resultado,
            dataFormatadaSql
        )
            .then(function (resultadoInsert) {
                if (atualizarPatenteAuto) {
                    partidaModel.buscarKpisUsuario(fkUsuario)
                        .then(function (kpis) {
                            if (kpis.length > 0) {
                                var k = kpis[0];
                                var sugerida = calcularPatenteSugerida(k.kdGeral, k.winRate, k.totalPartidas);
                                usuarioModel.atualizarPatente(fkUsuario, sugerida.id)
                                    .then(function () {
                                        res.status(201).json({
                                            mensagem: "Partida registrada com sucesso!",
                                            idPartida: resultadoInsert.insertId,
                                            novaPatente: sugerida
                                        });
                                    })
                                    .catch(function () {
                                        res.status(201).json({
                                            mensagem: "Partida registrada com sucesso!",
                                            idPartida: resultadoInsert.insertId
                                        });
                                    });
                            } else {
                                res.status(201).json(resultadoInsert);
                            }
                        })
                        .catch(function () {
                            res.status(201).json(resultadoInsert);
                        });
                } else {
                    res.status(201).json(resultadoInsert);
                }
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Houve um erro ao registrar a partida! Erro: ", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function buscarKpisUsuario(req, res) {
    var idUsuario = req.params.idUsuario;

    partidaModel.buscarKpisUsuario(idUsuario)
        .then(function (resultado) {
            if (resultado.length > 0) {
                var dados = resultado[0];
                var patenteSugerida = calcularPatenteSugerida(
                    dados.kdGeral,
                    dados.winRate,
                    dados.totalPartidas
                );
                dados.patenteSugerida = patenteSugerida.nome;
                dados.corPatenteSugerida = patenteSugerida.cor;
                dados.idPatenteSugerida = patenteSugerida.id;
                res.status(200).json(dados);
            } else {
                res.status(404).send("Usuário não encontrado!");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarTempoSemanalPorDia(req, res) {
    var idUsuario = req.params.idUsuario;

    var diasSemana = [
        { diaSemanaNum: 1, nomeDia: "Domingo", abreviacao: "Dom", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 2, nomeDia: "Segunda", abreviacao: "Seg", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 3, nomeDia: "Terça", abreviacao: "Ter", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 4, nomeDia: "Quarta", abreviacao: "Qua", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 5, nomeDia: "Quinta", abreviacao: "Qui", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 6, nomeDia: "Sexta", abreviacao: "Sex", minutosJogados: 0, qtdPartidas: 0 },
        { diaSemanaNum: 7, nomeDia: "Sábado", abreviacao: "Sáb", minutosJogados: 0, qtdPartidas: 0 }
    ];

    partidaModel.buscarTempoSemanalPorDia(idUsuario)
        .then(function (resultado) {
            var totalSemanaMinutos = 0;

            resultado.forEach(function (registro) {
                var idx = Number(registro.diaSemanaNum) - 1;
                if (idx >= 0 && idx < 7) {
                    diasSemana[idx].minutosJogados = Number(registro.minutosJogados);
                    diasSemana[idx].qtdPartidas = Number(registro.qtdPartidas);
                    totalSemanaMinutos += Number(registro.minutosJogados);
                }
            });

            var mediaDiariaMinutos = Number((totalSemanaMinutos / 7).toFixed(1));

            res.status(200).json({
                dias: diasSemana,
                totalSemanaMinutos: totalSemanaMinutos,
                mediaDiariaMinutos: mediaDiariaMinutos
            });
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarHistoricoKd(req, res) {
    var idUsuario = req.params.idUsuario;
    var limite = Number(req.query.limite) || 12;

    partidaModel.buscarHistoricoKd(idUsuario)
        .then(function (resultado) {
            var killsAcumuladas = 0;
            var mortesAcumuladas = 0;

            // Calcula o K/D acumulado juntando todas as partidas desde a primeira até o momento
            var comAcumulado = resultado.map(function (partida, index) {
                killsAcumuladas += Number(partida.kills) || 0;
                mortesAcumuladas += Number(partida.mortes) || 0;
                var kdAcumulado = Number((killsAcumuladas / Math.max(mortesAcumuladas, 1)).toFixed(2));

                return Object.assign({}, partida, {
                    numeroPartida: index + 1,
                    killsAcumuladas: killsAcumuladas,
                    mortesAcumuladas: mortesAcumuladas,
                    kdAcumulado: kdAcumulado
                });
            });

            // Retorna as mais recentes primeiro (até o limite solicitado)
            var ultimasPartidas = comAcumulado.reverse().slice(0, limite);
            res.status(200).json(ultimasPartidas);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function deletarPartida(req, res) {
    var idPartida = req.params.idPartida;
    var idUsuario = req.query.idUsuario || req.body.idUsuarioServer;

    if (!idPartida || !idUsuario) {
        res.status(400).send("ID da partida e ID do usuário são obrigatórios!");
        return;
    }

    partidaModel.deletarPartida(idPartida, idUsuario)
        .then(function (resultado) {
            res.status(200).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    registrarPartida,
    buscarKpisUsuario,
    buscarTempoSemanalPorDia,
    buscarHistoricoKd,
    deletarPartida
};
