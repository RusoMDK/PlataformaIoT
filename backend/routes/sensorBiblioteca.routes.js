// routes/sensorBiblioteca.routes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/biblioteca_sensores.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const sensores = JSON.parse(rawData);
    res.json(sensores);
  } catch (error) {
    console.error("❌ Error al leer la biblioteca de sensores:", error);
    res.status(500).json({ msg: "Error al cargar la biblioteca de sensores" });
  }
});

module.exports = router;