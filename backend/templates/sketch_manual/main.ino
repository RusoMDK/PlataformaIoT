#include <WiFi.h>
#include <PubSubClient.h>
#include "config.h"

WiFiClient espClient;
PubSubClient mqtt(espClient);

unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 30000;

void setupWiFi()
{
    Serial.print("[WiFi] Conectando a: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20)
    {
        delay(500);
        Serial.print(".");
        retries++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
        Serial.println("\n[WiFi] ✅ Conectado correctamente");
        Serial.print("[WiFi] IP local: ");
        Serial.println(WiFi.localIP());
    }
    else
    {
        Serial.println("\n[WiFi] ❌ Error al conectar");
    }
}

void connectMQTT()
{
    mqtt.setServer(MQTT_SERVER, MQTT_PORT);

    Serial.print("[MQTT] Conectando como UID ");
    Serial.println(UID);

    int retries = 0;
    while (!mqtt.connected() && retries < 5)
    {
        if (mqtt.connect(UID, MQTT_USER, MQTT_PASS))
        {
            Serial.println("[MQTT] ✅ Conectado");
        }
        else
        {
            Serial.print("[MQTT] ❌ Fallo. Estado: ");
            Serial.println(mqtt.state());
            delay(2000);
            retries++;
        }
    }
}

void setup()
{
    Serial.begin(115200);
    delay(1000);
    setupWiFi();
    connectMQTT();
}

void loop()
{
    if (WiFi.status() != WL_CONNECTED)
    {
        Serial.println("[WiFi] ❌ Desconectado. Reintentando...");
        setupWiFi();
    }

    if (!mqtt.connected())
    {
        Serial.println("[MQTT] ❌ Desconectado. Reintentando...");
        connectMQTT();
    }

    mqtt.loop();

    unsigned long now = millis();
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL)
    {
        lastHeartbeat = now;

        String topic = String("devices/heartbeat/") + UID;
        String payload = WiFi.localIP().toString();

        if (mqtt.publish(topic.c_str(), payload.c_str()))
        {
            Serial.print("[Heartbeat] ✅ Enviado: ");
            Serial.print(topic);
            Serial.print(" -> ");
            Serial.println(payload);
        }
        else
        {
            Serial.println("[Heartbeat] ❌ Fallo al publicar");
        }
    }
}