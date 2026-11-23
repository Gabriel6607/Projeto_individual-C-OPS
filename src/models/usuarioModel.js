var database = require("../database/config");

function cadastrar(nome, email, senhaHash) {
    var instrucaoSql = "INSERT INTO usuario (nome, email, senha_hash) VALUES (?, ?, ?)";
    return database.executar(instrucaoSql, [nome, email, senhaHash]);
}

function buscarPorEmail(email) {
    var instrucaoSql = "SELECT id, senha_hash FROM usuario WHERE email = ?";
    return database.executar(instrucaoSql, [email]);
}

function buscarSessao(tokenHash) {
    var instrucaoSql = `
        SELECT u.id, u.nome FROM sessao s
        JOIN usuario u ON u.id = s.usuario_id
        WHERE s.token_hash = ? AND s.expira_em > UTC_TIMESTAMP()`;
    return database.executar(instrucaoSql, [tokenHash]);
}

async function cadastrarSessao(idUsuario, tokenHash) {
    var limparExpiradas = "DELETE FROM sessao WHERE usuario_id = ? AND expira_em <= UTC_TIMESTAMP()";
    await database.executar(limparExpiradas, [idUsuario]);

    var instrucaoSql = `
        INSERT INTO sessao (token_hash, usuario_id, expira_em)
        VALUES (?, ?, UTC_TIMESTAMP() + INTERVAL 7 DAY)`;
    return database.executar(instrucaoSql, [tokenHash, idUsuario]);
}

function encerrarSessao(tokenHash) {
    return database.executar("DELETE FROM sessao WHERE token_hash = ?", [tokenHash]);
}

module.exports = { cadastrar, buscarPorEmail, buscarSessao, cadastrarSessao, encerrarSessao };
