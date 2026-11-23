var database = require("../database/config");

function buscarRegistros(idUsuario, inicio, fim) {
    var instrucaoSql = `
        SELECT r.id, r.data_jogo AS data, r.quantidade, r.minutos_estimados AS minutos, m.nome AS mapa
        FROM registro_partida r JOIN mapa m ON m.id = r.mapa_id
        WHERE r.usuario_id = ? AND r.data_jogo BETWEEN ? AND ?
        ORDER BY r.data_jogo DESC, r.id DESC`;
    return database.executar(instrucaoSql, [idUsuario, inicio, fim]);
}

function buscarMapasMaisJogados(idUsuario) {
    var instrucaoSql = `
        SELECT m.nome, m.imagem, SUM(r.quantidade) AS partidas, SUM(r.minutos_estimados) AS minutos
        FROM registro_partida r JOIN mapa m ON m.id = r.mapa_id
        WHERE r.usuario_id = ?
        GROUP BY m.id, m.nome, m.imagem ORDER BY partidas DESC, m.nome`;
    return database.executar(instrucaoSql, [idUsuario]);
}

module.exports = { buscarRegistros, buscarMapasMaisJogados };
