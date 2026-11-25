// ============================================================================
// GERENCIAMENTO E REGISTRO DE PARTIDAS - C-OPS TIME TRACKER
// ============================================================================

function inicializarTelaPartidas() {
    if (!validarSessao()) return;

    definirDataHoraAtualPadrao();
    atualizarPreviewKd();
    carregarHistoricoPartidas();
}

function definirDataHoraAtualPadrao() {
    var inputData = document.getElementById("data_partida_input");
    if (!inputData) return;

    var agora = new Date();
    var offsetMs = agora.getTimezoneOffset() * 60000;
    var localIso = new Date(agora.getTime() - offsetMs).toISOString().slice(0, 16);
    inputData.value = localIso;
}

function atualizarPreviewKd() {
    var kills = Number(document.getElementById("kills_input").value) || 0;
    var mortes = Number(document.getElementById("mortes_input").value) || 0;
    var kd = kills / Math.max(mortes, 1);

    var badge = document.getElementById("preview_kd_badge");
    if (badge) {
        badge.textContent = "K/D: " + kd.toFixed(2);
    }
}

function salvarPartida() {
    var idUsuario = sessionStorage.ID_USUARIO;
    var modoJogo = document.getElementById("modo_jogo_input").value;
    var mapa = document.getElementById("mapa_input").value;
    var duracao = document.getElementById("duracao_input").value;
    var kills = document.getElementById("kills_input").value;
    var mortes = document.getElementById("mortes_input").value;
    var resultado = document.getElementById("resultado_input").value;
    var dataPartida = document.getElementById("data_partida_input").value;

    var validacao = validarFormularioPartida(
        modoJogo,
        mapa,
        duracao,
        kills,
        mortes,
        resultado,
        dataPartida
    );

    if (!validacao.valido) {
        exibirAlertaFormulario(validacao.mensagem, "erro");
        return false;
    }

    fetch("/partidas/registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: Number(idUsuario),
            modoJogoServer: modoJogo,
            mapaServer: mapa,
            duracaoMinutosServer: Number(duracao),
            killsServer: Number(kills),
            mortesServer: Number(mortes),
            resultadoServer: resultado,
            dataPartidaServer: dataPartida,
            atualizarPatenteAutoServer: false
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirAlertaFormulario(
                    "Partida salva com sucesso!",
                    "sucesso"
                );
                carregarHistoricoPartidas();
            } else {
                resposta.text().then(function (texto) {
                    exibirAlertaFormulario(texto || "Não foi possível salvar a partida.", "erro");
                });
            }
        })
        .catch(function (erro) {
            console.error(erro);
            exibirAlertaFormulario("Erro de conexão ao salvar a partida.", "erro");
        });

    return false;
}

function carregarHistoricoPartidas() {
    var idUsuario = sessionStorage.ID_USUARIO;
    if (!idUsuario) return;

    fetch("/partidas/historico-kd/" + idUsuario + "?limite=30", { cache: "no-store" })
        .then(function (resposta) {
            if (!resposta.ok) throw new Error("Erro ao listar partidas");
            return resposta.json();
        })
        .then(function (partidas) {
            var contador = document.getElementById("contador_partidas");
            if (contador) {
                contador.textContent = partidas.length + " partidas";
            }

            var tbody = document.getElementById("tabela_historico_partidas");
            if (!tbody) return;

            if (partidas.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="8" class="empty-row">Nenhuma partida registrada ainda.</td></tr>';
                return;
            }

            var html = "";
            partidas.forEach(function (p) {
                var kdNum = Number(p.kdPartida) || 0;
                var classeKd = kdNum >= 1.2 ? "badge-kd-alto" : kdNum >= 1.0 ? "badge-kd-medio" : "badge-kd-baixo";
                var classeResultado = p.resultado === "Vitoria" ? "badge-vitoria" : "badge-derrota";
                var textoResultado = p.resultado === "Vitoria" ? "Vitória" : "Derrota";

                html += `
                    <tr>
                        <td>${p.dataFormatada}</td>
                        <td><strong>${p.mapa}</strong> <small class="text-muted">(${p.modoJogo})</small></td>
                        <td>${p.duracaoMinutos} min</td>
                        <td class="col-kills">${p.kills}</td>
                        <td class="col-mortes">${p.mortes}</td>
                        <td><span class="badge-kd ${classeKd}">${kdNum.toFixed(2)}</span></td>
                        <td><span class="badge-resultado ${classeResultado}">${textoResultado}</span></td>
                        <td>
                            <button class="btn-delete-match" onclick="excluirPartida(${p.id})">Remover</button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        })
        .catch(function (erro) {
            console.error(erro);
        });
}

function excluirPartida(idPartida) {
    var idUsuario = sessionStorage.ID_USUARIO;
    if (!idPartida || !idUsuario) return;

    fetch("/partidas/deletar/" + idPartida + "?idUsuario=" + idUsuario, {
        method: "DELETE"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirAlertaFormulario("Partida removida do histórico!", "sucesso");
                carregarHistoricoPartidas();
            } else {
                exibirAlertaFormulario("Não foi possível remover a partida.", "erro");
            }
        })
        .catch(function (erro) {
            console.error(erro);
        });
}
