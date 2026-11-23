var express = require("express");
var router = express.Router();
var conquistasController = require("../controllers/conquistasController");
var usuarioController = require("../controllers/usuarioController");

router.use(usuarioController.validarSessao);
router.get("/", conquistasController.buscarConquistas);
router.post("/", conquistasController.cadastrarConquista);
router.put("/:id", conquistasController.editarConquista);
router.delete("/:id", conquistasController.excluirConquista);

module.exports = router;
