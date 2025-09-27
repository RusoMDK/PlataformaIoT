const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { obtenerDispositivoPorUID } = require('../services/sketchManual.service');
const { generarConfigHeaderManual } = require('../utils/generarConfigManual');

// Contenido del README de ayuda
const README_CONTENT = `
SMART IOT - Configuración Manual de tu Dispositivo
==================================================

¡Hola Maker! 👋

Gracias por usar el modo manual de configuración. Este paquete contiene los archivos necesarios para conectar tu ESP32/ESP8266 a tu red Wi‑Fi y enviar datos a la plataforma Smart IoT.

Archivos incluidos:
-------------------
1. main.ino       → Código principal para cargar en tu placa
2. config.h       → Configuración con tus credenciales únicas
3. README.txt     → Este documento de ayuda

Pasos para usar este sketch:
----------------------------

1. Abre Arduino IDE o PlatformIO
2. Instala el soporte para ESP32 si aún no lo has hecho:
   URL de tarjetas: https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

3. En Arduino IDE:
   - Ve a "Archivo → Preferencias"
   - Pega la URL anterior en "Gestor de URLs adicionales de tarjetas"
   - Luego ve a "Herramientas → Placa → Gestor de tarjetas" y busca "ESP32"
   - Instala el paquete oficial de Espressif

4. Abre el archivo main.ino y asegúrate de tener seleccionada la placa adecuada (Ej. "ESP32 Dev Module").

5. Abre config.h y edita únicamente las siguientes líneas:

   #define WIFI_SSID     "TU_RED_WIFI"
   #define WIFI_PASSWORD "TU_CONTRASEÑA_WIFI"

   ❌ No modifiques el UID ni las credenciales MQTT, ya están configuradas para ti y son necesarias para comunicarte con el sistema.

6. Conecta tu placa y selecciona el puerto correcto en el IDE.

7. Sube el código a tu placa y abre el Monitor Serial.

8. Si todo va bien, deberías ver:
   - Conexión Wi‑Fi exitosa
   - Conexión con el broker MQTT local
   - Envío periódico de heartbeat

¿Problemas para subir el código?
- Verifica que seleccionaste el puerto correcto
- Instala drivers si tu placa lo requiere (Ej. CP2102, CH340)
- Revisa que no tengas otra app ocupando el puerto (como el agente Smart IoT)

¿Necesitas soporte?
📧 Contáctanos desde la plataforma o en el canal de soporte técnico.

¡Éxito en tu proyecto IoT! 💡🔧🚀
`;

exports.descargarSketchManual = async (req, res) => {
  const { uid } = req.params;

  try {
    const dispositivo = await obtenerDispositivoPorUID(uid);
    if (!dispositivo) return res.status(404).json({ error: 'Dispositivo no encontrado' });

    const sketchPath = path.join(__dirname, '..', 'sketches', 'manual');
    const tempPath = path.join(__dirname, '..', 'tmp', `manual-${uid}`);
    fs.mkdirSync(tempPath, { recursive: true });

    // 1. Copiar main.ino base
    fs.copyFileSync(
      path.join(sketchPath, 'main.ino'),
      path.join(tempPath, 'main.ino')
    );

    // 2. Generar config.h personalizado
    generarConfigHeaderManual(tempPath, {
      UID: dispositivo.uid,
      MQTT_SERVER: dispositivo.mqttServer,
      MQTT_PORT: dispositivo.mqttPort,
      MQTT_USER: dispositivo.mqttUser,
      MQTT_PASS: dispositivo.mqttPass,
    });

    // 3. Escribir el archivo README.txt
    fs.writeFileSync(
      path.join(tempPath, 'README.txt'),
      README_CONTENT.trim()
    );

    // 4. Comprimir el paquete como .zip
    const zipName = `sketch-${uid}.zip`;
    const zipPath = path.join(__dirname, '..', 'tmp', zipName);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');

    archive.pipe(output);
    archive.file(path.join(tempPath, 'main.ino'), { name: 'main.ino' });
    archive.file(path.join(tempPath, 'config.h'), { name: 'config.h' });
    archive.file(path.join(tempPath, 'README.txt'), { name: 'README.txt' });
    await archive.finalize();

    output.on('close', () => {
      res.download(zipPath, zipName, err => {
        if (err) console.error('❌ Error al enviar el zip:', err);
        fs.rmSync(tempPath, { recursive: true, force: true });
        fs.unlinkSync(zipPath);
      });
    });
  } catch (err) {
    console.error('🔥 Error en descargarSketchManual:', err);
    res.status(500).json({ error: 'Error al generar el sketch' });
  }
};
