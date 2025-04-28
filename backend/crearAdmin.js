// crearAdmin.js
require('dotenv').config(); // 👈 Asegura que se cargue .env
const mongoose = require('./src/config/db');
const Usuario = require('./src/models/Usuario');

async function crearAdmin() {
  try {
    await Usuario.deleteMany({}); // opcional: borrar todos
    const admin = new Usuario({
      nombre: 'Admin',
      email: 'admin@granja.com',
      password: 'admin123', // 👉 Esto será hasheado automáticamente
      rol: 'admin'
    });

    await admin.save();
    console.log('✅ Admin creado correctamente');
    process.exit();
  } catch (err) {
    console.error('❌ Error al crear admin:', err);
    process.exit(1);
  }
}

crearAdmin();