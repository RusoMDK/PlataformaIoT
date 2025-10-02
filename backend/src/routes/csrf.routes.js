// src/routes/csrf.routes.js
const express = require('express');
const router = express.Router();
const csrfProtection = require('../middlewares/csrfProtection');

const isProd = process.env.NODE_ENV === 'production';

router.get('/csrf-token', csrfProtection, (req, res) => {
  // Token ligado al secret guardado en cookie httpOnly por csurf
  const token = req.csrfToken();

  // Cookie "legible" para el FE (opcional, tu FE ya toma el token del body)
  // La dejamos por si quieres leerla desde FE en algún flujo
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,   // el FE podría leerla si quisieras
    secure: isProd,    // solo segura en prod/HTTPS
    sameSite: 'Lax',
    // maxAge opcional:
    // maxAge: 60 * 60 * 1000, // 1h
  });

  // Devuelve el token en el body (tu FE lo usa así)
  res.json({ csrfToken: token });
});

module.exports = router;
