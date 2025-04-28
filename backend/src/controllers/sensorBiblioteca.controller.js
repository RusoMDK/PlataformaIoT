const path = require("path");
const fs = require("fs");

const rutaArchivo = path.join(__dirname, "../data/sensores.json");

exports.buscarSensores = (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();

  try {
    if (!fs.existsSync(rutaArchivo)) {
      return res.status(500).json({ msg: "Archivo de sensores no encontrado" });
    }

    const rawData = fs.readFileSync(rutaArchivo, "utf-8");
    const sensores = JSON.parse(rawData);

    const resultados = sensores.filter((sensor) => {
      return (
        sensor.nombre?.toLowerCase().includes(query) ||
        sensor.modelo?.toLowerCase().includes(query) ||
        sensor.descripcion?.toLowerCase().includes(query)
      );
    });

    res.json(resultados.slice(0, 20)); // devolvemos máximo 20 sugerencias
  } catch (err) {
    console.error("❌ Error leyendo biblioteca de sensores:", err);
    res.status(500).json({ msg: "Error interno al buscar sensores" });
  }
};