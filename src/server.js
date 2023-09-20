
const app = require('./app');
const logger = require('./logger');

// Initialize the application
init();

async function init() {
    try {
        // Start the app listening on port 3001
        app.listen(3001, () => {
            logger.info('App Listening on Port => http://localhost:3001/');
            logger.info('Swagger Documentation => http://localhost:3001/api-docs/');

        });
    } catch (error) {
        // Log the error and exit the application with a failure status
        logger.error(`An error occurred: ${JSON.stringify(error)}`);
        process.exit(1);
    }
}