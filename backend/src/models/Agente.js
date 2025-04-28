// backend/models/Agente.js
const mongoose = require("mongoose");

const agenteSchema = new mongoose.Schema({
  usuarioId:     { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", unique: true, required: true },
  socketId:      { type: String, default: null },
  firstConnected:{ type: Date, default: Date.now },
  lastHeartbeat: { type: Date, default: Date.now },
  ip:             { type: String }, // 🔥 Agregado aquí
  dispositivos:  [
    {
      uid:    String,
      nombre: String
    }
  ],
}, {
});

module.exports = mongoose.model("Agente", agenteSchema);