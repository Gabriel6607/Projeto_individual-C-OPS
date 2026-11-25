var database = require("../database/config");

function garantirPatentesPadrao() {
    console.log("ACESSEI O USUARIO MODEL - function garantirPatentesPadrao()");
    var instrucaoSql = `
        INSERT IGNORE INTO patente (id, nome, ordem_nivel, cor_hex) VALUES
            (1, 'Iron', 1, '#71717a'),
            (2, 'Bronze', 2, '#b45309'),
            (3, 'Silver', 3, '#94a3b8'),
            (4, 'Gold', 4, '#eab308'),
            (5, 'Platinum', 5, '#06b6d4'),
            (6, 'Diamond', 6, '#3b82f6'),
            (7, 'Master', 7, '#a855f7'),
            (8, 'Spec Ops', 8, '#f97316'),
            (9, 'Elite Ops', 9, '#ef4444');
    `;
    return database.executar(instrucaoSql).catch(function () {
        // Compatibilidade caso a tabela tenha sido criada com a coluna antiga kd_referencia
        var sqlFallback = `
            INSERT IGNORE INTO patente (id, nome, ordem_nivel, kd_referencia, cor_hex) VALUES
                (1, 'Iron', 1, 0.60, '#71717a'),
                (2, 'Bronze', 2, 0.80, '#b45309'),
                (3, 'Silver', 3, 0.95, '#94a3b8'),
                (4, 'Gold', 4, 1.10, '#eab308'),
                (5, 'Platinum', 5, 1.25, '#06b6d4'),
                (6, 'Diamond', 6, 1.45, '#3b82f6'),
                (7, 'Master', 7, 1.65, '#a855f7'),
                (8, 'Spec Ops', 8, 1.90, '#f97316'),
                (9, 'Elite Ops', 9, 2.20, '#ef4444');
        `;
        return database.executar(sqlFallback);
    });
}

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL - function autenticar():", email);
    var instrucaoSql = `
        SELECT 
            u.id,
            u.nick,
            u.id_jogo AS idJogo,
            u.email,
            u.fk_patente AS fkPatente,
            p.nome AS nomePatente,
            p.cor_hex AS corPatente
        FROM usuario u
        JOIN patente p ON u.fk_patente = p.id
        WHERE u.email = '${email}' AND u.senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nick, idJogo, email, senha) {
    console.log("ACESSEI O USUARIO MODEL - function cadastrar():", nick, idJogo, email);
    var instrucaoSql = `
        INSERT INTO usuario (nick, id_jogo, email, senha, fk_patente)
        VALUES ('${nick}', '${idJogo}', '${email}', '${senha}', 1);
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPatentes() {
    console.log("ACESSEI O USUARIO MODEL - function listarPatentes()");
    var instrucaoSql = `
        SELECT 
            id,
            nome,
            ordem_nivel AS ordemNivel,
            cor_hex AS corHex
        FROM patente
        ORDER BY ordem_nivel ASC;
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizarPatente(idUsuario, fkPatente) {
    console.log("ACESSEI O USUARIO MODEL - function atualizarPatente():", idUsuario, fkPatente);
    var instrucaoSql = `
        UPDATE usuario
        SET fk_patente = ${Number(fkPatente)}
        WHERE id = ${Number(idUsuario)};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    garantirPatentesPadrao,
    autenticar,
    cadastrar,
    listarPatentes,
    atualizarPatente
};
