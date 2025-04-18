// swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Granja Inteligente API',
      version: '1.0.0',
      description: 'Documentación de la API para la plataforma IoT de gestión de proyectos',
    },
    servers: [
      {
        url: 'http://localhost:4000/api',
        description: 'Servidor local de desarrollo',
      },
    ],
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js'], // rutas donde Swagger buscará anotaciones
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };