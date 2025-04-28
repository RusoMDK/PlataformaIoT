 // src/middlewares/csrfProtection.js
const csrf = require('csurf');

const csrfProtection = csrf({
  cookie: true, // 🔥 Activar CSRF usando cookies
});

module.exports = csrfProtection;