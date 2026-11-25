var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
});

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/patentes", function (req, res) {
    usuarioController.listarPatentes(req, res);
});

router.put("/patente/:idUsuario", function (req, res) {
    usuarioController.atualizarPatente(req, res);
});

module.exports = router;
