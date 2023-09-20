const {Router, body, logger, httpStatus, requestValidation} = require('../utils/commons');
const {sequelize} = require('../model')
const jobService = require('../services/jobs.service');
const router = new Router();

/**
 * @swagger
 * /unpaid:
 *   get:
 *     summary: Retrieve Unpaid Jobs for Authenticated User
 *     description: This endpoint retrieves all unpaid jobs for the authenticated user.
 *                  The user profile is determined by the authentication process and is 
 *                  thus not required as an explicit parameter.
 *     responses:
 *       200:
 *         description: Successfully retrieved unpaid jobs
 *       500:
 *         description: Internal server error occurred while retrieving unpaid jobs
 */
router.get('/unpaid', async (req, res) => {
    try {
        const profileId = req.profile.id;

        // Log the incoming request, including profile ID for tracking
        logger.info(`New Request for Retrieving Unpaid Jobs - ProfileId: ${profileId}`);

        // Validation logic: Check if profile ID exists
        if (!profileId) throw new Error('Error: profile_id is required');

        // Business logic: Use the service layer to retrieve unpaid jobs
        const unpaidJobs = await jobService.getUserUnpaidJobs(profileId);

        // Handling response: Send back the retrieved unpaid jobs
        res.status(httpStatus.OK).json({ unpaidJobs });

    } catch (error) {
        // Log and handle the error
        logger.error(`Error During Retrieval of Unpaid Jobs - ProfileId: ${req.profile.id}, Error: ${error}`);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal Error During Unpaid Jobs Retrieval', error });
    }
});


/**
 * @swagger
 * /:job_id/pay:
 *   post:
 *     summary: Process Payment for a Specific Job
 *     description: |
 *       This endpoint is responsible for processing payments for a job.
 *       The job ID is specified in the path and the request body.
 *       The request is authenticated and the user is verified as the owner of the job
 *       before proceeding with the payment.
 *     parameters:
 *       - name: job_id
 *         description: Job ID to be paid for.
 *         in: path
 *         required: true
 *         type: integer
 *       - name: job_id
 *         description: Job ID to be paid for (also in request body for redundancy).
 *         in: body
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Payment for the job was successful.
 *       500:
 *         description: Internal server error, unable to complete the payment.
 */
router.post('/:job_id/pay', [
    // Validation middleware: Validate that job_id exists and is an integer
    body('job_id').exists().isInt().withMessage('JobId is required')
], async (req, res) => {
    let transaction;
    try {
        // Logging: Track incoming requests and log job ID
        logger.info(`New Request to Process Payment for Job - ID: ${req.params.job_id}`);

        // Input validation
        await requestValidation(req.params.job_id);

        // Initialize a database transaction
        transaction = await sequelize.transaction()
        try {

            logger.info(`Transaction Started for Payment Processing - Job ID: ${req.params.job_id}`);

            // Authorization: Ensure the user making the request owns the job
            await jobService.validateJobOwnership(req.params.job_id, req.profile.id, transaction);

            logger.info(`User Authorized to Pay for Job - Job ID: ${req.params.job_id}`);

            // Business logic: Process the payment
            const payJob = await jobService.payJob(req.params.job_id, req.profile.id, transaction);

            // Commit the transaction
            await transaction.commit();

            // Send successful response
            res.status(httpStatus.OK).json({result: payJob});
        } catch (innerError) {
            // Log the error and rollback the transaction
            logger.error(`Transaction Rollback Due to Error: ${innerError}`);
            await transaction.rollback();
            throw innerError;
        }
    } catch (error) {
        // Log the error
        logger.error(`Internal Error While Processing Payment for Job - ID: ${req.params.job_id}, Error: ${error}`);

        // Send error response
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: 'Internal Error During Payment Processing', error});
    }
});


module.exports = router;