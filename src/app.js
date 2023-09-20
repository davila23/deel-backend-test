// Import required modules and middleware
const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');

// Import Swagger for API documentation
const swaggerUI = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// Import controllers
const contractsController = require('./controllers/contracts.controller');
const jobsController = require('./controllers/jobs.controller');
const balancesController = require('./controllers/balances.controller');
const adminController = require('./controllers/admin.controller');

// Swagger options configuration
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Davila -> Deel Home Task",
            version: "2.3.4",
            description: "API documentation for Deel Home Task"
        },
        servers: [
            {
                url: "http://localhost:3001" // Ajusta la URL según tu configuración
            }
        ]
    },
    apis: [
        "./controllers/contracts.controller.js",
        "./controllers/jobs.controller.js",
        "./controllers/balances.controller.js",
        "./controllers/admin.controller.js"
    ] 
};

// Generate Swagger documentation based on defined options
const specs = swaggerJsdoc(options);

// Initialize Express application
const app = express();

// Make Sequelize available to the application
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

// Middleware to parse incoming JSON data
app.use(bodyParser.json());

// Attach Swagger UI at the "/api-docs" endpoint
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));

// Define routes and attach middleware and controllers
// Attach "getProfile" middleware to automatically fetch profile for "/contracts", "/jobs", and "/balances" routes
app.use('/contracts', getProfile, contractsController);
app.use('/jobs', getProfile, jobsController);
app.use('/balances', getProfile, balancesController);

// Admin route doesn't require "getProfile" middleware
app.use('/admin', adminController);

// Export the app to be used elsewhere (like in a test or the app's entry point)
module.exports = app;
