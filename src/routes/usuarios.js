var express = require("express");
var router = express.Router();
var usuarioController = require("../controllers/usuarioController");

router.post("/usuarios", usuarioController.cadastrar);
router.post("/sessao", usuarioController.autenticar);
router.get("/sessao", usuarioController.validarSessao, usuarioController.buscarSessao);
router.delete("/sessao", usuarioController.sair);

module.exports = router;
