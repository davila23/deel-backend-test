const { Router, logger, httpStatus, requestValidation, param} = require('../utils/commons');

const contractService = require('../services/contracts.service');
const UnauthorizedError = require('../errors/errorHandler').UnauthorizedError;

const router = new Router();

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Retrieve a Contract by ID
 *     description: This endpoint retrieves a contract by its ID. The ID is passed as a URL parameter. 
 *                  The request must be authorized, i.e., the ID in the request must match the profile ID of the requester.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Contract ID to retrieve
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful retrieval of the contract
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */
router.get('/:id', [
    // Validate that the contract ID exists and is an integer
    param('id').exists().isInt().withMessage('Contract id must be an integer and is required')
], async (req, res) => {
    try {
        // Extract contract ID from the URL parameters
        const { id } = req.params;

        // Log the incoming request for tracking purposes
        logger.info(`New Request for Contract Retrieval - Contract ID: ${id}`);

        // Validate request parameters
        await requestValidation(req);

        // Authorization check: Ensure that the requester is authorized to access the contract
        if (id !== req.profile.id.toString()) {
            throw new UnauthorizedError('Unauthorized Request');
        }

        // Retrieve the contract using the service layer
        const contract = await contractService.getContractById(id, req.profile.id);

        // Respond with the retrieved contract
        res.status(httpStatus.OK).json({ contract });

    } catch (error) {
        // Specific handling for unauthorized errors
        if (error instanceof UnauthorizedError) {
            logger.error(`Unauthorized Request for Contract Retrieval - Contract ID: ${req.params.id}, ${error}`);
            res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized', error });
        } else {
            // Log and handle other types of errors
            logger.error(`Error During Contract Retrieval - Contract ID: ${req.params.id}, Error: ${error}`);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Error During Contract Retrieval', error });
        }
    }
});


/**
 * @swagger
 * /:
 *   get:
 *     summary: Retrieve Non-Terminated User Contracts
 *     description: This endpoint retrieves all non-terminated contracts for the authenticated user.
 *                  It doesn't require any additional parameters as the user profile is determined by the authentication process.
 *     responses:
 *       200:
 *         description: Successfully retrieved non-terminated contracts
 *       500:
 *         description: Internal server error occurred while retrieving contracts
 */
router.get(
    '/',
    async (req, res) => {
        try {
            // Log the incoming request for tracking purposes
            logger.info('New Request for Retrieving Non-Terminated User Contracts');

            // Retrieve non-terminated contracts for the authenticated user using the service layer
            const contracts = await contractService.getNonTerminatedUserContracts(req.profile.id);

            // Respond with the retrieved contracts
            res.status(httpStatus.OK).json({ contracts });

        } catch (error) {
            // Log and handle the error
            logger.error(`Error During Retrieval of Non-Terminated User Contracts: ${error}`);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Error During Non-Terminated Contracts Retrieval', error });
        }
    }
);

module.exports = router;
