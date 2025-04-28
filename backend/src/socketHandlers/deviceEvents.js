// backend/socketHandlers/deviceEvents.js

const Dispositivo = require("../models/Dispositivo");
const Agente      = require("../models/Agente");
const AgenteLog   = require("../models/AgenteLog");
const jwt         = require("jsonwebtoken");
const { Types }   = require("mongoose");
const Usuario     = require("../models/Usuario");


let dashboardNs = null;

async function upsertAgente(usuarioId, updates) {
  const doc = await Agente.findOne({ usuarioId });
  if (!doc) {
    return Agente.create({ usuarioId, ...updates });
  }
  Object.assign(doc, updates);
  return doc.save();
}

function initDeviceSocketHandlers(agentNs, dashNs) {
  dashboardNs = dashNs;

  dashboardNs.on("connection", socket => {
    console.log("📡 [DashboardConnect] Nuevo cliente dashboard conectado");

    const threshold = new Date(Date.now() - 5 * 60 * 1000);
    Agente.find({ lastHeartbeat: { $gte: threshold } })
      .select("usuarioId socketId firstConnected lastHeartbeat dispositivos")
      .lean()
      .then(async docs => {
        const payload = await Promise.all(
          docs.map(async a => {
            const user = await Usuario.findById(a.usuarioId).select("nombre email").lean();
            return {
              socketId:      a.socketId,
              usuario:       user,
              connectedAt:   a.firstConnected,
              lastHeartbeat: a.lastHeartbeat,
              dispositivos:  a.dispositivos,
            };
          })
        );
        dashboardNs.emit("agentes-activos", payload);
      })
      .catch(console.error);
  });

  agentNs.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Token requerido"));
    try {
      socket.usuarioId = jwt.verify(token, process.env.JWT_SECRET).id;
      console.log(`✅ [Auth] Usuario ${socket.usuarioId} autenticado`);
      return next();
    } catch (err) {
      console.warn("❌ [Auth] Token inválido:", err.message);
      return next(new Error("Token inválido"));
    }
  });

  agentNs.on("connection", socket => {
    const { id: socketId, usuarioId } = socket;
    const now = new Date();
    const ip = socket.handshake.address;
    console.log(`📡 [AgentConnect] socketId=${socketId}, usuarioId=${usuarioId}`);

    upsertAgente(usuarioId, {
      socketId,
      firstConnected: now,
      lastHeartbeat: now,
      dispositivos: [],
      ip,
    }).catch(console.error);

    AgenteLog.create({ socketId, usuarioId, evento: "connect", mensaje: "Conectado" }).catch(console.error);

    Usuario.findById(usuarioId).select("nombre email").lean()
      .then(user => {
        dashboardNs.emit("agente-conectado", {
          socketId,
          usuario: user,
          connectedAt: now,
          lastHeartbeat: now,
          dispositivos: [],
          ip,
        });
      })
      .catch(console.error);

    socket.on("heartbeat", ({ timestamp } = {}) => {
      const ht = timestamp ? new Date(timestamp) : new Date();
      upsertAgente(usuarioId, { lastHeartbeat: ht }).catch(console.error);
      AgenteLog.create({ socketId, usuarioId, evento: "heartbeat", mensaje: "Heartbeat" }).catch(console.error);
      dashboardNs.emit("agente-heartbeat", { socketId, lastHeartbeat: ht });
    });

    socket.on("device-detected", async data => {
      const uid = data.uid?.toLowerCase();
      if (!uid) return;

      await Dispositivo.findOneAndUpdate(
        { uid, usuario: new Types.ObjectId(usuarioId) },
        {
          $set: { ...data, uid, ultimaConexion: new Date() },
          $setOnInsert: { creadoEn: new Date(), configurado: false },
        },
        { upsert: true, new: true }
      );

      const agenteDoc = await upsertAgente(usuarioId, {});
      const agg = await Dispositivo.find({ usuario: usuarioId }).select("uid nombre").lean();
      agenteDoc.dispositivos = agg.map(d => ({ uid: d.uid, nombre: d.nombre }));
      await agenteDoc.save();

      AgenteLog.create({ socketId, usuarioId, evento: "device-detected", mensaje: "Device detected" }).catch(console.error);
      dashboardNs.emit("device-detected", { socketId, dispositivos: agenteDoc.dispositivos });
    });

    socket.on("device-updated", async data => {
      const uid = data.uid?.toLowerCase();
      if (!uid) return;

      await Dispositivo.findOneAndUpdate(
        { uid, usuario: new Types.ObjectId(usuarioId) },
        { $set: { ...data, ultimaConexion: new Date() } },
        { new: true }
      );

      const agenteDoc = await upsertAgente(usuarioId, {});
      const agg = await Dispositivo.find({ usuario: usuarioId }).select("uid nombre").lean();
      agenteDoc.dispositivos = agg.map(d => ({ uid: d.uid, nombre: d.nombre }));
      await agenteDoc.save();

      AgenteLog.create({ socketId, usuarioId, evento: "device-updated", mensaje: "Device updated" }).catch(console.error);
      dashboardNs.emit("device-updated", { socketId, dispositivos: agenteDoc.dispositivos });
    });

    socket.on("device-removed", data => {
      AgenteLog.create({ socketId, usuarioId, evento: "device-removed", mensaje: "Device removed" }).catch(console.error);
      dashboardNs.emit("device-removed", { socketId, uid: data.uid });
    });

    socket.on("disconnect", async () => {
      console.log(`⚠️ [AgentDisconnect] socketId=${socketId}, usuarioId=${usuarioId}`);

      await upsertAgente(usuarioId, {
        socketId: null,
        lastHeartbeat: null,
      });

      AgenteLog.create({ socketId, usuarioId, evento: "disconnect", mensaje: "Desconectado" }).catch(console.error);
      dashboardNs.emit("agente-desconectado", { usuarioId });
    });
  });
}

module.exports = { initDeviceSocketHandlers };