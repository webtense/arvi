const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ARVI API',
      version: '2.0.0',
      description: 'ARVI Manteniments Integrals - API de gestión empresarial',
      contact: {
        name: 'ARVI Soporte',
        email: 'soporte@arvimanteniment.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            cif: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            iban: { type: 'string' },
            contactPerson: { type: 'string' },
            notes: { type: 'string' },
            status: { type: 'string' }
          }
        },
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            invoiceNumber: { type: 'string' },
            clientName: { type: 'string' },
            clientCif: { type: 'string' },
            subtotal: { type: 'number' },
            taxTotal: { type: 'number' },
            total: { type: 'number' },
            status: { type: 'string' },
            type: { type: 'string' },
            date: { type: 'string', format: 'date' }
          }
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            budgetNumber: { type: 'string' },
            client: { type: 'string' },
            total: { type: 'number' },
            status: { type: 'string' }
          }
        },
        Part: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            partNumber: { type: 'string' },
            client: { type: 'string' },
            status: { type: 'string' },
            date: { type: 'string', format: 'date' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ARVI API Docs',
    customfavIcon: '/favicon.jpg'
  }));

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { swaggerDocs };