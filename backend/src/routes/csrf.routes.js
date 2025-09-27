// src/routes/csrf.routes.js
const express = require('express');
const router = express.Router();
const csrfProtection = require('../middlewares/csrfProtection');

router.get('/csrf-token', csrfProtection, (req, res) => {
  const token = req.csrfToken();

  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // Necesario para que el navegador lo exponga
    secure: true,    // Solo si estás usando HTTPS
    sameSite: 'Lax',
  });

  res.json({ csrfToken: token });
});

module.exports = router;
