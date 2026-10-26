# PlataformaIoT

Plataforma full stack para registrar dispositivos IoT, recibir sus lecturas en tiempo real y visualizarlas en dashboards configurables. Proyecto personal.

## Qué hace

- **Proyectos, dispositivos y sensores**: cada usuario organiza sus dispositivos por proyecto y elige sensores de una biblioteca.
- **Aprovisionamiento**: alta de dispositivos mediante *claim*, registro y *heartbeat*. Genera un sketch de Arduino (`main.ino` y `config.h`) listo para descargar.
- **Ingesta en tiempo real**: las lecturas llegan por **MQTT**, un worker las persiste en MongoDB y se emiten por **Socket.IO** al dashboard. Usa namespaces separados para agentes y para el panel.
- **Dashboards configurables**: widgets que se pueden arrastrar y redimensionar, con gráficas de series temporales.
- **Alertas y notificaciones**: reglas sobre las lecturas, con historial de alertas.
- **Exportación**: lecturas y proyectos a Excel, PDF y CSV.
- **Seguridad**: JWT en cookies, protección CSRF, 2FA con TOTP, roles (usuario / admin) y validación de entrada con Zod y AJV.
- **Documentación de la API** con Swagger en `/api/docs`.
- **Interfaz en español e inglés** (i18n).
- **Generación de código para dispositivos asistida por IA** (opcional, requiere clave de OpenAI).

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Node.js, Express 5, MongoDB (Mongoose), MQTT, Socket.IO, Swagger |
| Frontend | React 19, Vite, Tailwind CSS, Radix UI, React Hook Form + Zod, Recharts, react-grid-layout, i18next |
| Tests | Cypress (e2e) |

## Estructura

```
backend/
  server.js          # API HTTPS + Socket.IO
  src/
    routes/          # endpoints REST (/api/...)
    controllers/
    models/          # Mongoose: Dispositivo, Sensor, Lectura, Proyecto, Alerta...
    mqtt/            # cliente MQTT
    workers/         # ingesta de lecturas
    realtime/        # emisión de eventos y logs
    middlewares/     # auth, CSRF, roles
  templates/         # plantilla de sketch Arduino
frontend/
  src/
    pages/           # dashboard, dispositivos, proyectos, admin...
    components/
    widgets/
    i18n/            # es / en
```

## Puesta en marcha

Requisitos: Node.js 20+, MongoDB y un broker MQTT (por ejemplo, Mosquitto).

**Backend**

```bash
cd backend
cp .env.example .env    # MONGO_URI, JWT_SECRET, configuración MQTT...
npm install
npm start               # sirve la API por HTTPS
```

El servidor necesita un certificado local en `backend/certs/` (`agente.key` y `agente.crt`).

**Frontend**

```bash
cd frontend
cp .env.example .env    # VITE_API_URL, VITE_WS_URL
npm install
npm run dev
```

## Autor

Luis Manuel Santos · [LinkedIn](https://www.linkedin.com/in/luissantosdev/) · [Portfolio](https://luismsldev.vercel.app)
