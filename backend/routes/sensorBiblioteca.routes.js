const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const filePath = path.join(__dirname, '../data/biblioteca_sensores.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // 🔁 Convertimos de objeto { id: sensor } a array de sensores con campo `id`
    const sensores = Object.entries(data).map(([id, sensor]) => ({
      id,
      ...sensor
    }));

    res.json(sensores);
  } catch (err) {
    console.error('❌ Error leyendo biblioteca de sensores:', err);
    res.status(500).json({ error: 'Error cargando la biblioteca de sensores' });
  }
});

module.exports = router;