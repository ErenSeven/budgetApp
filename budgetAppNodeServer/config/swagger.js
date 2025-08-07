import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Budget App API',
    version: '1.0.0',
    description: 'Kişisel harcama yönetimi için REST API dokümantasyonu',
    contact: {
      name: 'Destek Ekibi',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Geliştirme sunucusu',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    }
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js', './models/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
