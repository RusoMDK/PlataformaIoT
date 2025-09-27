const express = require('express');
const router = express.Router();
const { descargarSketchManual } = require('../controllers/sketchManual.controller');

router.get('/manual/:uid', descargarSketchManual);

module.exports = router;
