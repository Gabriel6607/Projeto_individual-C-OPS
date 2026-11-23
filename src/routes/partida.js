var express = require("express");
var router = express.Router();
var partidaController = require("../controllers/partidaController");
var usuarioController = require("../controllers/usuarioController");

router.get("/mapas", partidaController.listarMapas);
router.post("/registros", usuarioController.validarSessao, partidaController.cadastrar);
router.delete("/registros/:id", usuarioController.validarSessao, partidaController.excluir);

module.exports = router;
