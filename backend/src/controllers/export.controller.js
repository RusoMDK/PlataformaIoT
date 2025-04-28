const Lectura = require('../models/Lectura');
const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Sensor = require('../models/Sensor');
const Log = require('../models/Log');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// 📤 Lecturas - Excel (usuario)
exports.exportarLecturasExcel = async (req, res) => {
  try {
    const { sensor } = req.query;
    const lecturas = await Lectura.find({ sensor, usuario: req.usuarioId });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Lecturas');

    sheet.columns = [
      { header: 'Valor', key: 'valor', width: 10 },
      { header: 'Unidad', key: 'unidad', width: 10 },
      { header: 'Fecha', key: 'timestamp', width: 30 }
    ];

    lecturas.forEach(l => {
      sheet.addRow({
        valor: l.valor,
        unidad: l.unidad,
        timestamp: l.timestamp.toLocaleString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=lecturas.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exportando Excel:', err);
    res.status(500).json({ msg: 'Error al exportar a Excel', error: err.message });
  }
};

// 📤 Lecturas - PDF (usuario)
exports.exportarLecturasPDF = async (req, res) => {
  try {
    const { sensor } = req.query;
    const lecturas = await Lectura.find({ sensor, usuario: req.usuarioId });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=lecturas.pdf');
    doc.pipe(res);

    doc.fontSize(16).text('Lecturas del sensor', { underline: true });
    doc.moveDown();

    lecturas.forEach(l => {
      doc.fontSize(12).text(`• ${l.valor} ${l.unidad} - ${l.timestamp.toLocaleString()}`);
    });

    doc.end();
  } catch (err) {
    console.error('Error exportando PDF:', err);
    res.status(500).json({ msg: 'Error al exportar a PDF', error: err.message });
  }
};

// 📤 Usuarios - CSV (admin)
exports.exportarUsuariosCSV = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password').lean();
    const parser = new Parser({ fields: ['nombre', 'email', 'rol', 'activo'] });
    const csv = parser.parse(usuarios);

    res.header('Content-Type', 'text/csv');
    res.attachment('usuarios.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Error al exportar usuarios:", err);
    res.status(500).json({ msg: 'Error al exportar usuarios' });
  }
};

// 📤 Proyectos - CSV (admin)
exports.exportarProyectosCSV = async (req, res) => {
  try {
    const proyectos = await Proyecto.find().populate('usuario', 'nombre email').lean();
    const datosPlano = proyectos.map(p => ({
      nombre: p.nombre,
      descripcion: p.descripcion,
      placa: p.placa,
      usuario_nombre: p.usuario?.nombre || 'Sin nombre',
      usuario_email: p.usuario?.email || 'Sin email'
    }));

    const parser = new Parser({ fields: ['nombre', 'descripcion', 'placa', 'usuario_nombre', 'usuario_email'] });
    const csv = parser.parse(datosPlano);

    res.header('Content-Type', 'text/csv');
    res.attachment('proyectos.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Error al exportar proyectos:", err);
    res.status(500).json({ msg: 'Error al exportar proyectos' });
  }
};

// 📤 Logs - CSV (admin)
exports.exportarLogsCSV = async (req, res) => {
  try {
    const logs = await Log.find().populate('usuario', 'nombre email').lean();
    const datosPlano = logs.map(log => ({
      nombre: log.usuario?.nombre || 'Sin nombre',
      email: log.usuario?.email || 'Sin email',
      accion: log.accion,
      detalle: log.detalle,
      fecha: log.fecha.toLocaleString()
    }));

    const parser = new Parser({ fields: ['nombre', 'email', 'accion', 'detalle', 'fecha'] });
    const csv = parser.parse(datosPlano);

    res.header('Content-Type', 'text/csv');
    res.attachment('logs.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Error al exportar logs:", err);
    res.status(500).json({ msg: 'Error al exportar logs' });
  }
};

// 📤 Proyectos del usuario autenticado - CSV
exports.exportarMisProyectosCSV = async (req, res) => {
  try {
    const proyectos = await Proyecto.find({ usuario: req.usuarioId }).lean();
    const parser = new Parser({ fields: ['nombre', 'descripcion', 'placa'] });
    const csv = parser.parse(proyectos);

    res.header('Content-Type', 'text/csv');
    res.attachment('mis_proyectos.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Error al exportar mis proyectos:", err);
    res.status(500).json({ msg: 'Error al exportar tus proyectos' });
  }
};

// 📤 Logs del usuario autenticado - CSV
exports.exportarMisLogsCSV = async (req, res) => {
  try {
    const logs = await Log.find({ usuario: req.usuarioId }).lean();
    const parser = new Parser({ fields: ['accion', 'detalle', 'fecha'] });
    const csv = parser.parse(logs);

    res.header('Content-Type', 'text/csv');
    res.attachment('mis_logs.csv');
    res.send(csv);
  } catch (err) {
    console.error("❌ Error al exportar mis logs:", err);
    res.status(500).json({ msg: 'Error al exportar tus logs' });
  }
};

// 📤 Proyecto completo - Excel (usuario)
exports.exportarProyectoCompletoExcel = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findOne({ _id: id, usuario: req.usuarioId }).lean();
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const sensores = await Sensor.find({ proyecto: id, usuario: req.usuarioId }).lean();
    const workbook = new ExcelJS.Workbook();

    // Proyecto info
    const sheetProyecto = workbook.addWorksheet('Proyecto');
    sheetProyecto.addRow(['Nombre', proyecto.nombre]);
    sheetProyecto.addRow(['Descripción', proyecto.descripcion]);
    sheetProyecto.addRow(['Placa', proyecto.placa]);
    sheetProyecto.addRow([]);

    // Sensores
    const sheetSensores = workbook.addWorksheet('Sensores');
    sheetSensores.columns = [
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Tipo', key: 'tipo', width: 20 },
      { header: 'Unidad', key: 'unidad', width: 10 },
      { header: 'Pin', key: 'pin', width: 10 }
    ];
    sensores.forEach(s => sheetSensores.addRow(s));

    // Lecturas por sensor
    for (const sensor of sensores) {
      const lecturas = await Lectura.find({ sensor: sensor._id }).lean();
      const sheet = workbook.addWorksheet(sensor.nombre);
      sheet.columns = [
        { header: 'Valor', key: 'valor', width: 10 },
        { header: 'Unidad', key: 'unidad', width: 10 },
        { header: 'Fecha', key: 'timestamp', width: 30 }
      ];
      lecturas.forEach(l => sheet.addRow({ valor: l.valor, unidad: l.unidad, timestamp: l.timestamp.toLocaleString() }));
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=proyecto_completo.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("❌ Error al exportar proyecto completo Excel:", err);
    res.status(500).json({ msg: 'Error al exportar proyecto completo' });
  }
};

// 📤 Proyecto completo - PDF (usuario)
exports.exportarProyectoCompletoPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await Proyecto.findOne({ _id: id, usuario: req.usuarioId }).lean();
    if (!proyecto) return res.status(404).json({ msg: 'Proyecto no encontrado' });

    const sensores = await Sensor.find({ proyecto: id, usuario: req.usuarioId }).lean();
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=proyecto_completo.pdf');
    doc.pipe(res);

    doc.fontSize(18).text('📦 Proyecto: ' + proyecto.nombre, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Descripción: ${proyecto.descripcion}`);
    doc.text(`Placa: ${proyecto.placa}`);
    doc.moveDown();

    sensores.forEach(sensor => {
      doc.fontSize(14).text(`🔧 Sensor: ${sensor.nombre}`);
      doc.fontSize(12).text(`• Tipo: ${sensor.tipo}`);
      doc.text(`• Unidad: ${sensor.unidad}`);
      doc.text(`• Pin: ${sensor.pin}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error("❌ Error al exportar proyecto completo PDF:", err);
    res.status(500).json({ msg: 'Error al exportar proyecto completo' });
  }
};