var mysql = require("mysql2/promise");

var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || "cops_tracker",
    dateStrings: true,
    decimalNumbers: true,
    connectionLimit: 8
});

function executar(instrucaoSql, parametros = [], conexao = pool) {
    return conexao.execute(instrucaoSql, parametros).then(function (resultado) {
        return resultado[0];
    });
}

module.exports = { executar, pool };
