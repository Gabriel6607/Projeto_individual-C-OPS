var database = require("../database/config");
var diarioModel = require("./diarioModel");

function listarMapas() {
    var instrucaoSql = "SELECT id, nome, imagem, ranqueado FROM mapa ORDER BY nome";
    return database.executar(instrucaoSql);
}

async function cadastrar(idUsuario, data, idMapa, quantidade) {
    var conexao = await database.pool.getConnection();
    try {
        await conexao.beginTransaction();

        // Duas abas do mesmo jogador não podem ultrapassar juntas o limite diário.
        await database.executar("SELECT id FROM usuario WHERE id = ? FOR UPDATE", [idUsuario], conexao);
        var totalDia = await database.executar(`
            SELECT COALESCE(SUM(quantidade), 0) AS partidas FROM registro_partida
            WHERE usuario_id = ? AND data_jogo = ?`, [idUsuario, data], conexao);

        if (totalDia[0].partidas + quantidade > diarioModel.MAXIMO_DIARIO) {
            throw diarioModel.falha(400, `O total do dia passaria de ${diarioModel.MAXIMO_DIARIO} partidas (24h estimadas). Confira a quantidade.`);
        }

        var instrucaoSql = `
            INSERT INTO registro_partida (usuario_id, data_jogo, mapa_id, quantidade)
            SELECT ?, ?, id, ? FROM mapa WHERE id = ? AND ranqueado = 1`;
        var resultado = await database.executar(instrucaoSql, [idUsuario, data, quantidade, idMapa], conexao);
        if (!resultado.affectedRows) {
            throw diarioModel.falha(400, "Escolha um mapa da lista de ranqueadas.");
        }

        await conexao.commit();
        return resultado;
    } catch (erro) {
        await conexao.rollback();
        throw erro;
    } finally {
        conexao.release();
    }
}

function excluir(idRegistro, idUsuario) {
    var instrucaoSql = "DELETE FROM registro_partida WHERE id = ? AND usuario_id = ?";
    return database.executar(instrucaoSql, [idRegistro, idUsuario]);
}

module.exports = { listarMapas, cadastrar, excluir };
