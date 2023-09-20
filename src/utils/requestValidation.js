const { BadRequestError } = require('../errors/errorHandler');
const { validationResult} = require('express-validator');

/**
 * requestValidation - Middleware function for handling request validation
 * 
 * This function uses `express-validator` to check if the incoming request 
 * meets the set validation rules. If any validation rule is violated, 
 * a BadRequestError is thrown, indicating what went wrong in the request.
 *
 * @param {Object} req - The Express request object
 * @throws {BadRequestError} - Thrown if request validation fails
 */
async function requestValidation(req) {

    // Run the validations defined in the request-handling route
    const validation = validationResult(req);

    // Check if there are any validation errors
    if (!validation.isEmpty()) {

        // Log the errors for debugging purposes
        const err = validation.errors;
        console.log(`Validation Error: ${JSON.stringify(err)}`);

        // Throw a BadRequestError to be handled by global error handling middleware
        throw new BadRequestError(err);
    }
}

// Export the requestValidation function for use in other modules
module.exports = {
    requestValidation
};
