// src/utils/generarConfigManual.js
const fs = require('fs');
const path = require('path');

exports.generarConfigHeaderManual = (destino, vars) => {
  const contenido = `#pragma once

#define WIFI_SSID ""
#define WIFI_PASSWORD ""

#define UID "${vars.UID}"
#define MQTT_SERVER "${vars.MQTT_SERVER}"
#define MQTT_PORT ${vars.MQTT_PORT}
#define MQTT_USER "${vars.MQTT_USER}"
#define MQTT_PASS "${vars.MQTT_PASS}"
`;

  fs.writeFileSync(path.join(destino, 'config.h'), contenido);
};
