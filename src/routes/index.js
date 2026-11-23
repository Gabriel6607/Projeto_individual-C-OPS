var express = require("express");
var router = express.Router();

router.get("/dashboard/analise.html", function (req, res) {
    res.redirect("/dashboard/dashboard.html#mapas");
});

router.get("/dashboard/metricas-graf.html", function (req, res) {
    res.redirect("/dashboard/dashboard.html#tempo");
});

module.exports = router;
