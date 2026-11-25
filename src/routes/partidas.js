var express = require("express");
var router = express.Router();

var partidaController = require("../controllers/partidaController");

router.post("/registrar", function (req, res) {
    partidaController.registrarPartida(req, res);
});

router.get("/kpis/:idUsuario", function (req, res) {
    partidaController.buscarKpisUsuario(req, res);
});

router.get("/tempo-semanal/:idUsuario", function (req, res) {
    partidaController.buscarTempoSemanalPorDia(req, res);
});

router.get("/historico-kd/:idUsuario", function (req, res) {
    partidaController.buscarHistoricoKd(req, res);
});

router.delete("/deletar/:idPartida", function (req, res) {
    partidaController.deletarPartida(req, res);
});

module.exports = router;
