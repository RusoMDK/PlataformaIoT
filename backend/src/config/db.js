// config/db.js
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/granja_iot';

console.log("📡 Intentando conectar a MongoDB:", uri);

mongoose.connect(uri)
  .then(() => {
    console.log("✅ Conectado a MongoDB correctamente");
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err.message);
  });

module.exports = mongoose;