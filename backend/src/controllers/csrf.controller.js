// backend/src/controllers/csrf.controller.js
exports.getCsrfToken = (req, res) => {
  const token = req.csrfToken(); // 👈 SOLO lo generas una vez

  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,   // debe ser false para que el navegador lo lea
    sameSite: 'Lax',
    secure: true,      // true si estás usando HTTPS
  });

  res.json({ csrfToken: token }); // 👈 el mismo que mandaste por cookie
};
