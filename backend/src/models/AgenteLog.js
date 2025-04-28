// backend/models/AgenteLog.js
const mongoose = require("mongoose");

const agenteLogSchema = new mongoose.Schema({
  socketId: {
    type: String,
    required: true,
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  evento: {
    type: String,
    enum: [
      "connect",
      "disconnect",
      "device-detected",
      "device-updated",
      "device-removed",
      "heartbeat",
      "error"
    ],
    required: true,
  },
  mensaje: {
    type: String,
    required: true,
  },
  extra: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

module.exports = mongoose.model("AgenteLog", agenteLogSchema);