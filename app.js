var express = require("express");
var path = require("path");
var caminhoEnv = process.argv.includes("--dev") ? ".env.dev" : ".env";
require("dotenv").config({ path: path.join(__dirname, caminhoEnv) });

var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var partidaRouter = require("./src/routes/partida");
var estatisticaRouter = require("./src/routes/estatisticas");
var conquistasRouter = require("./src/routes/conquistas");

var app = express();
app.disable("x-powered-by");
app.use("/api", express.json({ limit: "16kb" }));
app.use("/api", function (req, res, next) {
    res.set("Cache-Control", "no-store");
    next();
});

// Rotas da área do jogador
app.use("/api", usuarioRouter);
app.use("/api", partidaRouter);
app.use("/api/painel", estatisticaRouter);
app.use("/api/conquistas", conquistasRouter);
app.use("/api", function (req, res) {
    res.status(404).json({ erro: "Recurso não encontrado." });
});

app.use("/", indexRouter);
app.use(express.static(path.join(__dirname, "public")));

// Resposta comum para falhas encaminhadas pelos controllers
app.use(function (erro, req, res, next) {
    var status = erro.status || 500;
    var mensagem = erro.message;

    if (status >= 500) {
        console.error("Falha na aplicação:", erro.code || erro.name);
        mensagem = "Não foi possível acessar o diário agora. Tente novamente.";
    } else if (erro.type === "entity.parse.failed") {
        mensagem = "JSON inválido.";
    }

    res.status(status).json({ erro: mensagem });
});

if (require.main === module) {
    var porta = Number(process.env.APP_PORT || 8080);
    app.listen(porta, function () {
        console.log(`C-ops Tracker: http://${process.env.APP_HOST || "localhost"}:${porta}`);
    });
}

module.exports = app;
