var database = require("../database/config");

function buscarConquistas(idUsuario) {
    var instrucaoSql = `
        SELECT id, data_conquista AS data, titulo, nota FROM conquista
        WHERE usuario_id = ? ORDER BY data_conquista DESC, id DESC`;
    return database.executar(instrucaoSql, [idUsuario]);
}

function buscarProgresso(idUsuario) {
    var instrucaoSql = `
        SELECT COUNT(DISTINCT data_jogo) AS dias, COUNT(DISTINCT mapa_id) AS mapas,
               COUNT(DISTINCT YEARWEEK(data_jogo, 3)) AS semanas
        FROM registro_partida WHERE usuario_id = ?`;
    return database.executar(instrucaoSql, [idUsuario]);
}

function cadastrarConquista(conquista, idUsuario) {
    var instrucaoSql = "INSERT INTO conquista (data_conquista, titulo, nota, usuario_id) VALUES (?, ?, ?, ?)";
    return database.executar(instrucaoSql, [conquista.data, conquista.titulo, conquista.nota, idUsuario]);
}

function editarConquista(conquista, idConquista, idUsuario) {
    var instrucaoSql = "UPDATE conquista SET data_conquista = ?, titulo = ?, nota = ? WHERE id = ? AND usuario_id = ?";
    return database.executar(instrucaoSql, [conquista.data, conquista.titulo, conquista.nota, idConquista, idUsuario]);
}

function excluirConquista(idConquista, idUsuario) {
    var instrucaoSql = "DELETE FROM conquista WHERE id = ? AND usuario_id = ?";
    return database.executar(instrucaoSql, [idConquista, idUsuario]);
}

module.exports = { buscarConquistas, buscarProgresso, cadastrarConquista, editarConquista, excluirConquista };
