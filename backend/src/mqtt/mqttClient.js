const mqtt = require('mqtt');
const Dispositivo = require('../models/Dispositivo');

const BROKER_URL = process.env.MQTT_SERVER || 'mqtt://localhost:1883';
const TOPIC = 'devices/heartbeat/+';

let client;

function initMQTTListener() {
  client = mqtt.connect(BROKER_URL);

  client.on('connect', () => {
    console.log(`📡 Conectado al broker MQTT en ${BROKER_URL}`);
    client.subscribe(TOPIC, err => {
      if (err) return console.error('❌ Error al suscribirse al topic:', err);
      console.log(`🔔 Suscrito a ${TOPIC}`);
    });
  });

  client.on('message', async (topic, message) => {
    try {
      const uid = topic.split('/')[2];
      const ip = message.toString();
      console.log(`💓 Heartbeat de ${uid} → IP: ${ip}`);

      // Opcional: actualizar en DB
      await Dispositivo.updateOne(
        { uid },
        { ultimaConexion: new Date(), ipUltimaConexion: ip }
      );
    } catch (error) {
      console.error('❌ Error procesando mensaje MQTT:', error);
    }
  });

  client.on('error', err => {
    console.error('❌ Error MQTT:', err);
  });
}

module.exports = { initMQTTListener };
