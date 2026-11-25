// ============================================================================
// DASHBOARD DINÂMICA E GRÁFICOS (CHART.JS) - C-OPS TIME TRACKER
// ============================================================================

var chartTempoSemanalInstance = null;
var chartRelacaoKdInstance = null;

function inicializarDashboard() {
    if (!validarSessao()) return;

    carregarListaPatentesSelect();
    atualizarDadosDashboard();
}

function formatarMinutosParaHoras(totalMinutos) {
    var min = Math.round(Number(totalMinutos) || 0);
    var horas = Math.floor(min / 60);
    var restoMin = min % 60;
    return horas + "h " + (restoMin < 10 ? "0" + restoMin : restoMin) + "m";
}

function atualizarDadosDashboard() {
    var idUsuario = sessionStorage.ID_USUARIO;
    if (!idUsuario) return;

    obterKpisUsuario(idUsuario);
    obterDadosGraficoTempoSemanal(idUsuario);
    obterDadosGraficoKd(idUsuario);
}

function carregarListaPatentesSelect() {
    fetch("/usuarios/patentes", { cache: "no-store" })
        .then(function (resposta) {
            if (resposta.ok) {
                resposta.json().then(function (patentes) {
                    var select = document.getElementById("select_patente_rapida");
                    if (!select) return;
                    select.innerHTML = '<option value="">Trocar patente...</option>';
                    patentes.forEach(function (p) {
                        var opt = document.createElement("option");
                        opt.value = p.id;
                        opt.textContent = p.nome;
                        select.appendChild(opt);
                    });
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao listar patentes:", erro);
        });
}

function alterarPatenteUsuario(fkPatente) {
    var idUsuario = sessionStorage.ID_USUARIO;
    if (!fkPatente || !idUsuario) return;

    fetch("/usuarios/patente/" + idUsuario, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fkPatenteServer: Number(fkPatente) })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                exibirAlertaFormulario("Sua patente foi atualizada!", "sucesso");
                obterKpisUsuario(idUsuario);
            }
        })
        .catch(function (erro) {
            console.error("Erro ao atualizar patente:", erro);
        });
}

// ============================================================================
// 1. BUSCA E RENDERIZAÇÃO DOS 4 KPIs COM INDICADORES DE CORES
// ============================================================================
function obterKpisUsuario(idUsuario) {
    fetch("/partidas/kpis/" + idUsuario, { cache: "no-store" })
        .then(function (resposta) {
            if (!resposta.ok) throw new Error("Falha ao buscar KPIs");
            return resposta.json();
        })
        .then(function (dados) {
            renderizarKpis(dados);
        })
        .catch(function (erro) {
            console.error("Erro ao carregar KPIs:", erro);
        });
}

function aplicarCorIndicador(cardEl, badgeEl, classeStatus, textoStatus) {
    if (!cardEl || !badgeEl) return;
    cardEl.classList.remove("borda-verde", "borda-amarela", "borda-vermelha");
    badgeEl.classList.remove("status-verde", "status-amarelo", "status-vermelho");

    if (classeStatus === "verde") {
        cardEl.classList.add("borda-verde");
        badgeEl.classList.add("status-verde");
    } else if (classeStatus === "amarelo") {
        cardEl.classList.add("borda-amarela");
        badgeEl.classList.add("status-amarelo");
    } else {
        cardEl.classList.add("borda-vermelha");
        badgeEl.classList.add("status-vermelho");
    }
    badgeEl.textContent = textoStatus;
}

function renderizarKpis(dados) {
    // KPI 1: Tempo Total Jogado na Semana (Dom a Sáb) e Média Diária
    // Foco: alertar quando o jogador estiver passando muitas horas jogando
    var tempoMin = Number(dados.tempoTotalSemanaMinutos) || 0;
    var mediaDiaria = Number(dados.mediaDiariaMinutos) || 0;

    document.getElementById("kpi_tempo_total").textContent = formatarMinutosParaHoras(tempoMin);
    document.getElementById("kpi_media_diaria").textContent =
        formatarMinutosParaHoras(mediaDiaria) + " (" + mediaDiaria.toFixed(0) + " min/dia)";

    var cardTempo = document.getElementById("card_kpi_tempo");
    var indTempo = document.getElementById("ind_tempo");
    if (mediaDiaria > 210) {
        // Mais de 3h30 por dia em média -> Alerta de muitas horas jogadas
        aplicarCorIndicador(cardTempo, indTempo, "vermelho", "Alerta: Muitas Horas");
    } else if (mediaDiaria > 120) {
        // Entre 2h e 3h30 por dia -> Atenção ao tempo
        aplicarCorIndicador(cardTempo, indTempo, "amarelo", "Atenção ao Tempo");
    } else {
        // Até 2h por dia -> Equilibrado
        aplicarCorIndicador(cardTempo, indTempo, "verde", "Tempo Equilibrado");
    }

    // KPI 2: Média de Kills e Mortes (KD)
    var kdGeral = Number(dados.kdGeral) || 0;
    var mediaKills = Number(dados.mediaKills) || 0;
    var mediaMortes = Number(dados.mediaMortes) || 0;

    document.getElementById("kpi_kd_geral").textContent = kdGeral.toFixed(2);
    document.getElementById("kpi_media_km").textContent =
        mediaKills.toFixed(1) + " Kills  /  " + mediaMortes.toFixed(1) + " Mortes";

    var cardKd = document.getElementById("card_kpi_kd");
    var indKd = document.getElementById("ind_kd");
    if (kdGeral >= 1.2) {
        aplicarCorIndicador(cardKd, indKd, "verde", "Bom K/D");
    } else if (kdGeral >= 1.0) {
        aplicarCorIndicador(cardKd, indKd, "amarelo", "Regular");
    } else {
        aplicarCorIndicador(cardKd, indKd, "vermelho", "Abaixo de 1.0");
    }

    // KPI 3: Patente Critical Ops (sem referência a K/D)
    var nomePatente = dados.patenteSalva || "Iron";
    var corPatente = dados.corPatenteSalva || "#38bdf8";
    var nivelPatente = Number(dados.nivelPatenteSalva) || 1;
    var elPatenteNome = document.getElementById("kpi_patente_nome");
    elPatenteNome.textContent = nomePatente;
    elPatenteNome.style.color = corPatente;

    var cardPatente = document.getElementById("card_kpi_patente");
    var indPatente = document.getElementById("ind_patente");
    if (nivelPatente >= 6) {
        aplicarCorIndicador(cardPatente, indPatente, "verde", nomePatente);
    } else if (nivelPatente >= 4) {
        aplicarCorIndicador(cardPatente, indPatente, "amarelo", nomePatente);
    } else {
        aplicarCorIndicador(cardPatente, indPatente, "amarelo", nomePatente);
    }

    // KPI 4: Win Rating
    var winRate = Number(dados.winRate) || 0;
    var vitorias = Number(dados.totalVitorias) || 0;
    var derrotas = Number(dados.totalDerrotas) || 0;
    var totalPartidas = Number(dados.totalPartidas) || 0;

    document.getElementById("kpi_winrate_valor").textContent = winRate.toFixed(1) + "%";
    document.getElementById("kpi_placar_vitorias").textContent =
        vitorias + "V - " + derrotas + "D (" + totalPartidas + " partidas)";

    var cardWin = document.getElementById("card_kpi_winrate");
    var indWin = document.getElementById("ind_winrate");
    if (winRate >= 55) {
        aplicarCorIndicador(cardWin, indWin, "verde", "Positivo");
    } else if (winRate >= 45) {
        aplicarCorIndicador(cardWin, indWin, "amarelo", "Equilibrado");
    } else {
        aplicarCorIndicador(cardWin, indWin, "vermelho", "Baixo");
    }
}

// ============================================================================
// 2. GRÁFICO DE BARRAS: TEMPO JOGADO NA SEMANA (DOM A SÁB) + MÉDIA DIÁRIA
// Destaque visual quando o jogador passa muitas horas jogando no dia
// ============================================================================
function obterDadosGraficoTempoSemanal(idUsuario) {
    fetch("/partidas/tempo-semanal/" + idUsuario, { cache: "no-store" })
        .then(function (resposta) {
            if (!resposta.ok) throw new Error("Falha ao buscar tempo semanal");
            return resposta.json();
        })
        .then(function (dadosSemana) {
            plotarGraficoTempoSemanal(dadosSemana);
        })
        .catch(function (erro) {
            console.error("Erro no gráfico de tempo semanal:", erro);
        });
}

function plotarGraficoTempoSemanal(dadosSemana) {
    var labels = dadosSemana.dias.map(function (d) { return d.nomeDia; });
    var valoresMinutos = dadosSemana.dias.map(function (d) { return d.minutosJogados; });
    var linhaMediaDiaria = dadosSemana.dias.map(function () { return dadosSemana.mediaDiariaMinutos; });

    // Cores inspiradas no Tempo de Uso + alerta para excesso de horas no dia:
    // > 210 min (3h30+) = Vermelho (alerta de muitas horas jogadas)
    // > 120 min (2h a 3h30) = Amarelo/Laranja (atenção)
    // <= 120 min (até 2h) = Azul (ritmo saudável/equilibrado)
    var diaComExcesso = false;
    var coresBarras = valoresMinutos.map(function (min) {
        if (min > 210) {
            diaComExcesso = true;
            return "rgba(239, 68, 68, 0.88)";
        }
        if (min > 120) {
            return "rgba(245, 158, 11, 0.85)";
        }
        return "rgba(56, 189, 248, 0.82)";
    });

    var subtitulo = document.getElementById("subtitulo_grafico_tempo");
    if (subtitulo) {
        if (diaComExcesso) {
            subtitulo.innerHTML =
                "⚠️ <strong style='color:#f87171'>Atenção:</strong> Há dias na semana com mais de 3h30 jogadas. Lembre-se de fazer pausas!";
        } else {
            subtitulo.textContent =
                "Tempo jogado por dia comparado com a linha tracejada da sua média diária";
        }
    }

    if (chartTempoSemanalInstance) {
        chartTempoSemanalInstance.data.labels = labels;
        chartTempoSemanalInstance.data.datasets[0].data = valoresMinutos;
        chartTempoSemanalInstance.data.datasets[0].backgroundColor = coresBarras;
        chartTempoSemanalInstance.data.datasets[1].data = linhaMediaDiaria;
        chartTempoSemanalInstance.update("none");
        return;
    }

    var ctx = document.getElementById("canvasTempoSemanal").getContext("2d");
    chartTempoSemanalInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    type: "bar",
                    label: "Tempo Jogado no Dia (min)",
                    data: valoresMinutos,
                    backgroundColor: coresBarras,
                    borderRadius: 6,
                    order: 2
                },
                {
                    type: "line",
                    label: "Média Diária (min)",
                    data: linhaMediaDiaria,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    borderWidth: 2,
                    borderDash: [6, 6],
                    pointRadius: 3,
                    pointBackgroundColor: "#10b981",
                    fill: false,
                    tension: 0,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "#cbd5e1", font: { family: "Barlow", size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var val = context.parsed.y;
                            return context.dataset.label + ": " + formatarMinutosParaHoras(val) + " (" + val + " min)";
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148, 163, 184, 0.08)" }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Minutos Jogados",
                        color: "#94a3b8"
                    },
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148, 163, 184, 0.12)" }
                }
            }
        }
    });
}

// ============================================================================
// 3. GRÁFICO DE LINHA: RELAÇÃO DO KD (KILLS, MORTES E KD RATIO) + TABELA
// ============================================================================
function obterDadosGraficoKd(idUsuario) {
    fetch("/partidas/historico-kd/" + idUsuario + "?limite=12", { cache: "no-store" })
        .then(function (resposta) {
            if (!resposta.ok) throw new Error("Falha ao buscar histórico de KD");
            return resposta.json();
        })
        .then(function (partidas) {
            renderizarTabelaUltimasPartidas(partidas);
            var partidasCronologicas = partidas.slice().reverse();
            plotarGraficoRelacaoKd(partidasCronologicas);
        })
        .catch(function (erro) {
            console.error("Erro no gráfico de relação KD:", erro);
        });
}

function plotarGraficoRelacaoKd(partidas) {
    var labels = partidas.map(function (p, idx) {
        var num = p.numeroPartida || (idx + 1);
        return "#" + num + " " + p.mapa + " (" + p.dataFormatada.split(" ")[0] + ")";
    });

    // Calcula ou utiliza o K/D acumulado juntando todas as partidas até cada momento
    var somaKills = 0;
    var somaMortes = 0;
    var serieKdAcumulado = partidas.map(function (p) {
        if (p.kdAcumulado !== undefined) {
            return Number(p.kdAcumulado);
        }
        somaKills += Number(p.kills) || 0;
        somaMortes += Number(p.mortes) || 0;
        return Number((somaKills / Math.max(somaMortes, 1)).toFixed(2));
    });

    if (chartRelacaoKdInstance) {
        chartRelacaoKdInstance.data.labels = labels;
        chartRelacaoKdInstance.data.datasets[0].data = serieKdAcumulado;
        chartRelacaoKdInstance.update("none");
        return;
    }

    var ctx = document.getElementById("canvasRelacaoKd").getContext("2d");
    chartRelacaoKdInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "K/D Acumulado Geral",
                    data: serieKdAcumulado,
                    borderColor: "#10b981",
                    backgroundColor: "rgba(16, 185, 129, 0.16)",
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: "#10b981",
                    pointBorderColor: "#0b0f17",
                    pointBorderWidth: 2,
                    fill: true,
                    tension: 0.25
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: "index",
                intersect: false
            },
            plugins: {
                legend: {
                    labels: { color: "#cbd5e1", font: { family: "Barlow", size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            var idx = context.dataIndex;
                            var p = partidas[idx];
                            var kdVal = Number(context.parsed.y).toFixed(2);
                            if (p && p.killsAcumuladas !== undefined) {
                                return "K/D Acumulado: " + kdVal + " (" + p.killsAcumuladas + " Kills / " + p.mortesAcumuladas + " Mortes no total)";
                            }
                            return "K/D Acumulado: " + kdVal;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#94a3b8", maxRotation: 30, minRotation: 0 },
                    grid: { color: "rgba(148, 163, 184, 0.08)" }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "K/D Acumulado",
                        color: "#10b981"
                    },
                    ticks: { color: "#94a3b8" },
                    grid: { color: "rgba(148, 163, 184, 0.12)" }
                }
            }
        }
    });
}

function renderizarTabelaUltimasPartidas(partidas) {
    var tbody = document.getElementById("tabela_ultimas_partidas");
    if (!tbody) return;

    if (!partidas || partidas.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="empty-row">Nenhuma partida registrada ainda. Clique em "+ Registrar Partida" para começar!</td></tr>';
        return;
    }

    var html = "";
    partidas.slice(0, 8).forEach(function (p) {
        var kdNum = Number(p.kdPartida) || 0;
        var classeKd = kdNum >= 1.2 ? "badge-kd-alto" : kdNum >= 1.0 ? "badge-kd-medio" : "badge-kd-baixo";
        var classeResultado = p.resultado === "Vitoria" ? "badge-vitoria" : "badge-derrota";
        var textoResultado = p.resultado === "Vitoria" ? "Vitória" : "Derrota";

        html += `
            <tr>
                <td>${p.dataFormatada}</td>
                <td>${p.modoJogo}</td>
                <td><strong>${p.mapa}</strong></td>
                <td>${p.duracaoMinutos} min</td>
                <td class="col-kills">${p.kills}</td>
                <td class="col-mortes">${p.mortes}</td>
                <td><span class="badge-kd ${classeKd}">${kdNum.toFixed(2)}</span></td>
                <td><span class="badge-resultado ${classeResultado}">${textoResultado}</span></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}
