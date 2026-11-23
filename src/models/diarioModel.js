var MINUTOS_PARTIDA = 40;
var ATENCAO_MINUTOS = 120;
var MAXIMO_DIARIO = 24 * 60 / MINUTOS_PARTIDA;

function falha(status, mensagem) {
    var erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function validarId(valor) {
    var id = Number(valor);
    if (!Number.isSafeInteger(id) || id < 1) {
        throw falha(400, "Identificador inválido.");
    }
    return id;
}

function hoje() {
    var formato = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo" });
    return formato.format(new Date());
}

function validarData(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor < "2015-01-01" || valor > hoje()) {
        throw falha(400, "Escolha uma data entre 2015 e hoje.");
    }

    var data = new Date(`${valor}T00:00:00Z`);
    if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor) {
        throw falha(400, "Data inválida.");
    }
    return valor;
}

function deslocar(data, dias) {
    var novaData = new Date(`${data}T00:00:00Z`);
    novaData.setUTCDate(novaData.getUTCDate() + dias);
    return novaData.toISOString().slice(0, 10);
}

// A consulta traz duas semanas: os primeiros sete dias servem para a comparação.
function resumir(fim, lancamentos) {
    var semana = [];
    var diasPorData = new Map();
    var registros = [];
    var minutos = 0;
    var partidas = 0;
    var minutosAnteriores = 0;

    for (var i = -6; i <= 0; i++) {
        var dia = { data: deslocar(fim, i), partidas: 0, minutos: 0 };
        semana.push(dia);
        diasPorData.set(dia.data, dia);
    }

    lancamentos.forEach(function (registro) {
        var dia = diasPorData.get(registro.data);
        if (dia) {
            dia.partidas += registro.quantidade;
            dia.minutos += registro.minutos;
            partidas += registro.quantidade;
            minutos += registro.minutos;
            registros.push(registro);
        } else {
            minutosAnteriores += registro.minutos;
        }
    });

    return {
        fim, semana, registros, minutos, partidas,
        media: Math.round(minutos / 7),
        diferenca: minutos - minutosAnteriores,
        limiteAtencao: ATENCAO_MINUTOS
    };
}

module.exports = { MINUTOS_PARTIDA, MAXIMO_DIARIO, hoje, validarId, validarData, deslocar, resumir, falha };
