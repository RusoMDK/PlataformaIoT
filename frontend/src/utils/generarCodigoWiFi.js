export const generarCodigoWiFi = ({ placa }) => {
  if (placa === 'esp32') {
    return `#include <WiFi.h>
  #include <ArduinoJson.h>
  #include <HTTPClient.h>
  
  bool yaVerificado = false;
  bool conectado = false;
  
  void setup() {
    Serial.begin(115200);
  }
  
  void loop() {
    if (Serial.available() && !conectado) {
      String input = Serial.readStringUntil('\\n');
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, input);
  
      if (!error) {
        const char* ssid = doc["ssid"];
        const char* password = doc["password"];
        const char* uid = doc["uid"];
        const char* ip = doc["ip"];
  
        Serial.print("Conectando a ");
        Serial.println(ssid);
  
        WiFi.begin(ssid, password);
        int intentos = 0;
        while (WiFi.status() != WL_CONNECTED && intentos < 10) {
          delay(1000);
          Serial.print(".");
          intentos++;
        }
  
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println("\\n✅ Conectado!");
          Serial.println(WiFi.localIP());
          conectado = true;
  
          if (uid && ip && !yaVerificado) {
            HTTPClient http;
            String url = String("http://") + ip + ":4000/api/dispositivos/verificar/" + uid;
            http.begin(url);
            int httpCode = http.GET();
  
            if (httpCode > 0) {
              Serial.println("📡 Verificación enviada correctamente");
            } else {
              Serial.print("❌ Error HTTP: ");
              Serial.println(httpCode);
            }
  
            http.end();
            yaVerificado = true;
          }
        } else {
          Serial.println("\\n❌ No se pudo conectar.");
        }
      }
    }
  }`;
  }

  if (placa === 'esp8266') {
    return `#include <ESP8266WiFi.h>
  #include <ArduinoJson.h>
  #include <ESP8266HTTPClient.h>
  
  bool yaVerificado = false;
  bool conectado = false;
  
  void setup() {
    Serial.begin(115200);
  }
  
  void loop() {
    if (Serial.available() && !conectado) {
      String input = Serial.readStringUntil('\\n');
      StaticJsonDocument<256> doc;
      DeserializationError error = deserializeJson(doc, input);
  
      if (!error) {
        const char* ssid = doc["ssid"];
        const char* password = doc["password"];
        const char* uid = doc["uid"];
        const char* ip = doc["ip"];
  
        Serial.print("Conectando a ");
        Serial.println(ssid);
  
        WiFi.begin(ssid, password);
        int intentos = 0;
        while (WiFi.status() != WL_CONNECTED && intentos < 10) {
          delay(1000);
          Serial.print(".");
          intentos++;
        }
  
        if (WiFi.status() == WL_CONNECTED) {
          Serial.println("\\n✅ Conectado!");
          Serial.println(WiFi.localIP());
          conectado = true;
  
          if (uid && ip && !yaVerificado) {
            HTTPClient http;
            String url = String("http://") + ip + ":4000/api/dispositivos/verificar/" + uid;
            http.begin(url);
            int httpCode = http.GET();
  
            if (httpCode > 0) {
              Serial.println("📡 Verificación enviada correctamente");
            } else {
              Serial.print("❌ Error HTTP: ");
              Serial.println(httpCode);
            }
  
            http.end();
            yaVerificado = true;
          }
        } else {
          Serial.println("\\n❌ No se pudo conectar.");
        }
      }
    }
  }`;
  }

  if (placa === 'mega' || placa === 'uno') {
    return `// Esta placa no tiene WiFi nativo.
  // Puedes conectar un módulo ESP8266 por Serial y usar comandos AT.
  // Ejemplo AT:
  // AT+CWMODE=1
  // AT+CWJAP="SSID","PASSWORD"
  // AT+CIFSR  --> Para obtener IP
  
  // O usa un ESP como pasarela para enviar datos desde esta placa.`;
  }

  return '// Código no disponible para esta placa todavía.';
};
