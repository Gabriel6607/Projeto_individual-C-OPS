var database = require("../database/config");

function registrarPartida(fkUsuario, modoJogo, mapa, duracaoMinutos, kills, mortes, resultado, dataPartida) {
    console.log("ACESSEI O PARTIDA MODEL - function registrarPartida():", fkUsuario, modoJogo, mapa);
    var instrucaoSql = `
        INSERT INTO partida (fk_usuario, modo_jogo, mapa, duracao_minutos, kills, mortes, resultado, data_partida)
        VALUES (${Number(fkUsuario)}, '${modoJogo}', '${mapa}', ${Number(duracaoMinutos)}, ${Number(kills)}, ${Number(mortes)}, '${resultado}', '${dataPartida}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarKpisUsuario(idUsuario) {
    console.log("ACESSEI O PARTIDA MODEL - function buscarKpisUsuario():", idUsuario);
    var instrucaoSql = `
        SELECT 
            u.id AS idUsuario,
            u.nick,
            u.id_jogo AS idJogo,
            u.fk_patente AS fkPatente,
            pat.nome AS patenteSalva,
            pat.cor_hex AS corPatenteSalva,
            pat.ordem_nivel AS nivelPatenteSalva,
            COALESCE(SUM(CASE WHEN YEARWEEK(p.data_partida, 0) = YEARWEEK(CURDATE(), 0) THEN p.duracao_minutos ELSE 0 END), 0) AS tempoTotalSemanaMinutos,
            ROUND(COALESCE(SUM(CASE WHEN YEARWEEK(p.data_partida, 0) = YEARWEEK(CURDATE(), 0) THEN p.duracao_minutos ELSE 0 END), 0) / 7, 1) AS mediaDiariaMinutos,
            COUNT(p.id) AS totalPartidas,
            COALESCE(SUM(p.kills), 0) AS totalKills,
            COALESCE(SUM(p.mortes), 0) AS totalMortes,
            ROUND(COALESCE(AVG(p.kills), 0), 1) AS mediaKills,
            ROUND(COALESCE(AVG(p.mortes), 0), 1) AS mediaMortes,
            ROUND(COALESCE(SUM(p.kills) / GREATEST(SUM(p.mortes), 1), 0), 2) AS kdGeral,
            COALESCE(SUM(CASE WHEN p.resultado = 'Vitoria' THEN 1 ELSE 0 END), 0) AS totalVitorias,
            COALESCE(SUM(CASE WHEN p.resultado = 'Derrota' THEN 1 ELSE 0 END), 0) AS totalDerrotas,
            ROUND(COALESCE((SUM(CASE WHEN p.resultado = 'Vitoria' THEN 1 ELSE 0 END) / NULLIF(COUNT(p.id), 0)) * 100, 0), 1) AS winRate
        FROM usuario u
        JOIN patente pat ON u.fk_patente = pat.id
        LEFT JOIN partida p ON p.fk_usuario = u.id
        WHERE u.id = ${Number(idUsuario)}
        GROUP BY u.id, u.nick, u.id_jogo, u.fk_patente, pat.nome, pat.cor_hex, pat.ordem_nivel;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarTempoSemanalPorDia(idUsuario) {
    console.log("ACESSEI O PARTIDA MODEL - function buscarTempoSemanalPorDia():", idUsuario);
    var instrucaoSql = `
        SELECT 
            DAYOFWEEK(data_partida) AS diaSemanaNum,
            COALESCE(SUM(duracao_minutos), 0) AS minutosJogados,
            COUNT(id) AS qtdPartidas
        FROM partida
        WHERE fk_usuario = ${Number(idUsuario)}
          AND YEARWEEK(data_partida, 0) = YEARWEEK(CURDATE(), 0)
        GROUP BY DAYOFWEEK(data_partida)
        ORDER BY diaSemanaNum ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarHistoricoKd(idUsuario) {
    console.log("ACESSEI O PARTIDA MODEL - function buscarHistoricoKd():", idUsuario);
    var instrucaoSql = `
        SELECT 
            p.id,
            p.modo_jogo AS modoJogo,
            p.mapa,
            p.duracao_minutos AS duracaoMinutos,
            p.kills,
            p.mortes,
            ROUND(p.kills / GREATEST(p.mortes, 1), 2) AS kdPartida,
            p.resultado,
            DATE_FORMAT(p.data_partida, '%d/%m %H:%i') AS dataFormatada,
            DATE_FORMAT(p.data_partida, '%Y-%m-%dT%H:%i') AS dataIso
        FROM partida p
        JOIN usuario u ON p.fk_usuario = u.id
        WHERE p.fk_usuario = ${Number(idUsuario)}
        ORDER BY p.data_partida ASC, p.id ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletarPartida(idPartida, idUsuario) {
    console.log("ACESSEI O PARTIDA MODEL - function deletarPartida():", idPartida, idUsuario);
    var instrucaoSql = `
        DELETE FROM partida
        WHERE id = ${Number(idPartida)} AND fk_usuario = ${Number(idUsuario)};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    registrarPartida,
    buscarKpisUsuario,
    buscarTempoSemanalPorDia,
    buscarHistoricoKd,
    deletarPartida
};
