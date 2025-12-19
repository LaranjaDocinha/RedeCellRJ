import swaggerAutogen from 'swagger-autogen';

const autogen = swaggerAutogen();

const doc = {
  info: {
    title: 'RedecellRJ API',
    description: 'API for the RedecellRJ POS and Management System'
  },
  host: 'localhost:5000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts']; // Point to the source input

autogen(outputFile, endpointsFiles, doc);
