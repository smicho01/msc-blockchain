// swagger.js

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0", // Swagger specification version
    info: {
      title: "Your API Title",
      version: "1.0.0",
      description: "API documentation generated by Swagger",
    },
    servers: [
      {
        url: "http://localhost:3001", // URL to the running server
      },
    ],
  },
  apis: ["./app/index.js"], // Location of your API routes for automatic documentation
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs,
};
