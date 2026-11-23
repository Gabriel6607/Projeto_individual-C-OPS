var express = require("express");
var router = express.Router();
var estatisticaController = require("../controllers/estatisticaController");
var usuarioController = require("../controllers/usuarioController");

router.get("/", usuarioController.validarSessao, estatisticaController.buscarPainel);

module.exports = router;
