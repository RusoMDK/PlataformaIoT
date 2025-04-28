const Agente = require("../models/Agente");
const AgenteLog = require("../models/AgenteLog");
const Usuario = require("../models/Usuario");
const Dispositivo = require("../models/Dispositivo");
const ExcelJS = require("exceljs");
const { Types } = require("mongoose");
const { registrarAgenteSchema } = require("../validations/agentes.validation");

/**
 * GET /api/agentes
 * Devuelve TODOS los agentes (online y offline) con info completa.
 */
exports.listarAgentes = async (req, res) => {
  try {
    const agentesDb = await Agente.find().lean();
    const usuarios = await Usuario.find({
      _id: { $in: agentesDb.map(a => a.usuarioId) },
    }).select("nombre email").lean();
    const mapUsuarios = new Map(usuarios.map(u => [u._id.toString(), u]));

    const now = Date.now();
    const ONLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutos

    const resultado = await Promise.all(
      agentesDb.map(async a => {
        let dispositivos = [];

        if (Array.isArray(a.dispositivos) && a.dispositivos.length) {
          dispositivos = a.dispositivos;
        } else {
          const fromDb = await Dispositivo.find({ usuario: a.usuarioId })
            .select("uid nombre fabricante chip path imagen")
            .lean();
          dispositivos = fromDb.map(d => ({
            uid: d.uid,
            nombre: d.nombre,
            fabricante: d.fabricante || null,
            chip: d.chip || null,
            path: d.path || null,
            imagen: d.imagen || null,
          }));
        }

        const user = mapUsuarios.get(a.usuarioId.toString()) || {};

        return {
          usuario: {
            _id: a.usuarioId,
            nombre: user.nombre || "—",
            email: user.email || "—",
          },
          socketId: a.socketId || null,
          ip: a.ip || "—",
          isOnline: a.lastHeartbeat ? (now - new Date(a.lastHeartbeat).getTime() < ONLINE_THRESHOLD) : false,
          connectedAt: a.firstConnected || null,
          lastHeartbeat: a.lastHeartbeat || null,
          dispositivos,
        };
      })
    );

    res.json(resultado);
  } catch (err) {
    console.error("❌ Error al listar agentes:", err);
    res.status(500).json({ msg: "Error interno al listar agentes" });
  }
};

/**
 * POST /api/agentes
 * Crea un nuevo agente validado.
 */
exports.crearAgente = async (req, res) => {
  try {
    const parsed = registrarAgenteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        msg: "Datos inválidos",
        errors: parsed.error.errors,
      });
    }

    const nuevoAgente = await Agente.create(parsed.data);
    res.status(201).json({ agente: nuevoAgente });
  } catch (err) {
    console.error("❌ Error al crear agente:", err);
    res.status(500).json({ msg: "Error interno" });
  }
};

/**
 * GET /api/agentes/agentes-activos
 * Devuelve solo los agentes activos (último heartbeat < 5 minutos).
 */
exports.obtenerAgentesActivos = async (req, res) => {
  try {
    const threshold = new Date(Date.now() - 5 * 60 * 1000);
    const activosDb = await Agente.find({ lastHeartbeat: { $gte: threshold } }).lean();
    const usuarios = await Usuario.find({
      _id: { $in: activosDb.map(a => a.usuarioId) },
    }).select("nombre email").lean();
    const mapU = new Map(usuarios.map(u => [u._id.toString(), u]));

    const resultado = activosDb.map(a => ({
      usuario: {
        _id: a.usuarioId,
        nombre: mapU.get(a.usuarioId.toString())?.nombre || "—",
        email: mapU.get(a.usuarioId.toString())?.email || "—",
      },
      socketId: a.socketId,
      ip: a.ip || "—",
      isOnline: true,
      connectedAt: a.firstConnected,
      lastHeartbeat: a.lastHeartbeat,
      dispositivos: a.dispositivos || [],
    }));

    res.json(resultado);
  } catch (err) {
    console.error("❌ Error al obtener agentes activos:", err);
    res.status(500).json({ msg: "Error interno al listar agentes activos" });
  }
};

/**
 * GET /api/agentes/historial
 * Devuelve el historial de conexiones.
 */
exports.listarHistorialAgentes = async (req, res) => {
  try {
    const historial = await AgenteLog.aggregate([
      { $match: { evento: "connect" } },
      { $sort: { timestamp: -1 } },
      { $group: {
        _id: "$usuarioId",
        lastConnected: { $first: "$timestamp" },
      }},
      { $lookup: {
        from: "usuarios",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      }},
      { $unwind: "$user" },
      { $project: {
        usuarioId: "$_id",
        nombre: "$user.nombre",
        email: "$user.email",
        lastConnected: 1,
      }},
      { $sort: { lastConnected: -1 } },
    ]);

    res.json(historial);
  } catch (err) {
    console.error("❌ Error al listar historial:", err);
    res.status(500).json({ msg: "Error al obtener historial" });
  }
};

/**
 * GET /api/agentes/exportar
 * Exporta agentes a Excel.
 */
exports.exportarAgentesExcel = async (req, res) => {
  try {
    const agentes = await Agente.find().lean();
    const usuarios = await Usuario.find({
      _id: { $in: agentes.map(a => a.usuarioId) },
    }).select("email").lean();
    const mapEmail = new Map(usuarios.map(u => [u._id.toString(), u.email]));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Agentes");

    sheet.columns = [
      { header: "Usuario", key: "email", width: 25 },
      { header: "Socket ID", key: "socketId", width: 36 },
      { header: "Online", key: "isOnline", width: 10 },
      { header: "Último HB", key: "lastHeartbeat", width: 30 },
      { header: "Dispositivos", key: "disp", width: 50 },
    ];

    for (const a of agentes) {
      const dispositivos = a.dispositivos?.length
        ? a.dispositivos
        : (await Dispositivo.find({ usuario: a.usuarioId }).select("uid").lean()).map(d => ({ uid: d.uid }));

      sheet.addRow({
        email: mapEmail.get(a.usuarioId.toString()) || "—",
        socketId: a.socketId || "—",
        isOnline: a.isOnline ? "Sí" : "No",
        lastHeartbeat: a.lastHeartbeat?.toLocaleString() || "—",
        disp: dispositivos.map(d => d.uid).join(", "),
      });
    }

    res
      .setHeader("Content-Disposition", "attachment; filename=agentes.xlsx")
      .setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Error al exportar agentes:", err);
    res.status(500).json({ msg: "Error interno" });
  }
};