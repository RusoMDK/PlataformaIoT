// src/middlewares/csrfProtection.js
const csrf = require('csurf');

const isProd = process.env.NODE_ENV === 'production';

// La cookie que almacena el "secret" de csurf (la que valida el token)
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,        // esta SÍ debe ser httpOnly (el FE no la lee)
    sameSite: 'Lax',
    secure: isProd,        // en prod por HTTPS
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'], // por claridad (default ya lo hace)
});

module.exports = csrfProtection;
