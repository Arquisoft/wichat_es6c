const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Configuración de Swagger
const options = {
  // video referencia: https://www.youtube.com/watch?v=GaxhRurZ26E
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Usuarios",
      version: "1.0.0",
      description: "Documentación de la API de Usuarios",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./routes/*.js"], // Ruta donde están las definiciones de los endpoints
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
