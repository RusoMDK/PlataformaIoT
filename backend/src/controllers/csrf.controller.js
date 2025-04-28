// src/controllers/csrf.controller.js
exports.getCsrfToken = (req, res) => {
    const token = req.csrfToken();
  
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,    // 🔥 Importante que sea false para que axios pueda leerlo
      secure: false,      // 🔥 Pon 'true' solo si usas HTTPS (en local debe ser false)
      sameSite: 'Lax',    // 🔥 Lax para localhost (no Strict)
    });
  
    res.json({ csrfToken: token });
  };