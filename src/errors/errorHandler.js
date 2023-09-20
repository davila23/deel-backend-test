const httpStatus = require('http-status');

// Base class for all custom errors, inherits from JavaScript Error class
class ServerError extends Error {
    constructor(code = httpStatus.INTERNAL_SERVER_ERROR, message = 'ERROR - > INTERNAL SERVER ERROR') {
        super(message);
        this.code = code;
        this.customError = true;
    }
}

// Error class for bad requests
class BadRequestError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.BAD_REQUEST, 'ERROR - > BAD REQUEST');
        this.errors = errors;
    }
}

// Error class for unauthorized deposits
class UnauthorizedDepositError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.NOT_ACCEPTABLE, 'ERROR - > UNAUTHORIZED DEPOSIT');
        this.errors = errors;
    }
}

// Error class for unauthorized actions
class UnauthorizedError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.UNAUTHORIZED, 'ERROR - > UNAUTHORIZED');
        this.errors = errors;
    }
}

// Error class for job-related issues
class JobError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.CONFLICT, 'ERROR - > JOB ERROR');  
        this.errors = errors;
    }
}

// Error class for insufficient funds in job transactions
class JobInsufficientFoundError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.BAD_REQUEST, 'ERROR - > INSUFFICIENT FUNDS'); 
        this.errors = errors;
    }
}

// Error class for not found errors
class NotFoundError extends ServerError {
    constructor(errors = []) {
        super(httpStatus.NOT_FOUND, 'ERROR - > NOT FOUND');
        this.errors = errors;
    }
}

// Export all the custom error classes
module.exports = {
    ServerError,
    BadRequestError,
    UnauthorizedDepositError,
    UnauthorizedError,
    JobError,
    JobInsufficientFoundError,
    NotFoundError
};
