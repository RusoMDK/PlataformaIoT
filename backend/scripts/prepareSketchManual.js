// scripts/prepareSketchManual.js
const fs = require('fs');
const path = require('path');

const ORIGEN = path.join(__dirname, '..', 'templates', 'sketch_manual');
const DESTINO = path.join(__dirname, '..', 'src', 'sketches', 'manual');

if (!fs.existsSync(ORIGEN)) {
  console.error('❌ Carpeta de origen no encontrada:', ORIGEN);
  process.exit(1);
}

fs.mkdirSync(DESTINO, { recursive: true });

for (const archivo of ['main.ino', 'config.h']) {
  const origenArchivo = path.join(ORIGEN, archivo);
  const destinoArchivo = path.join(DESTINO, archivo);

  if (!fs.existsSync(origenArchivo)) {
    console.warn(`⚠️ Archivo faltante en plantilla: ${archivo}`);
    continue;
  }

  fs.copyFileSync(origenArchivo, destinoArchivo);
  console.log(`✅ Copiado: ${archivo}`);
}

console.log('🛠️ Sketch manual preparado correctamente ✅');
