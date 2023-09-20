const { Router, query, logger, httpStatus, requestValidation } = require('../utils/commons');
const adminService = require('../services/admin.service');

const router = new Router();

/**
 * @swagger
 * /best-profession:
 *   get:
 *     summary: Get the Most In-Demand Profession
 *     description: Retrieves the most in-demand profession within a specified date range.
 *                  The function analyzes the data in the database to find out which profession has
 *                  the highest volume of work or contracts within the given dates.
 *     parameters:
 *       - name: start
 *         in: query
 *         description: The start date for the date range in YYYY-MM-DD format.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: end
 *         in: query
 *         description: The end date for the date range in YYYY-MM-DD format.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Successfully retrieved the most in-demand profession
 *       404:
 *         description: No best profession found within the specified date range
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get(
    '/best-profession', 
    [
        // Validate that both the start and end dates exist in the query parameters
        query('start').exists().withMessage('Start date is required'),
        query('end').exists().withMessage('End date is required')
    ],
    async (req, res, next) => {
        try {
            // Extract start and end dates from query parameters
            const { start, end } = req.query;
            
            // Log incoming request with parameters for better tracking and debugging
            logger.info(`New request: Most In-Demand Profession - Start Date: ${start}, End Date: ${end}`);

            // Validate incoming request using custom middleware
            await requestValidation(req);

            // Invoke business logic to find the most in-demand profession within the date range
            const bestProfession = await adminService.getBestProfession(start, end);

            // Send response based on the result of the business logic
            if (!bestProfession) {
                res.status(httpStatus.NOT_FOUND).json({ message: 'No most in-demand profession found within the specified date range' });
            } else {
                res.status(httpStatus.OK).json({ profession: bestProfession });
            }
        } catch (error) {
            // Log any errors that occur during the process
            logger.error(`Error in Most In-Demand Profession - Start Date: ${start}, End Date: ${end}, Error: ${error}`);
            next(error);
        }
    }
);


/**
 * @swagger
 * /best-clients:
 *   get:
 *     summary: Get Top Clients by Volume of Contracts
 *     description: Retrieves a list of the top clients based on the volume of contracts or engagements within a specified date range.
 *                  Clients are ranked in descending order of contract volume. 
 *                  The number of clients returned can be limited using the 'limit' query parameter.
 *     parameters:
 *       - name: start
 *         in: query
 *         description: The start date for the date range in YYYY-MM-DD format.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: end
 *         in: query
 *         description: The end date for the date range in YYYY-MM-DD format.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: limit
 *         in: query
 *         description: The maximum number of top clients to return. Optional.
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of top clients
 *       404:
 *         description: No top clients found within the specified date range
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Internal server error
 */
router.get(
    '/best-clients', 
    [
        // Validate that start and end dates exist, and that limit is an integer if provided
        query('start').exists().withMessage('Start date is required'),
        query('end').exists().withMessage('End date is required'),
        query('limit').optional().isInt().withMessage('Limit must be an integer')
    ],
    async (req, res, next) => {
        try {
            // Extract start, end, and limit from query parameters
            const { start, end, limit } = req.query;
            
            // Log incoming request with parameters for better tracking and debugging
            logger.info(`New request: Top Clients by Volume of Contracts - Start Date: ${start}, End Date: ${end}, Limit: ${limit || 'No Limit'}`);

            // Validate incoming request using custom middleware
            await requestValidation(req);

            // Invoke business logic to find the top clients within the date range and limit
            const bestClients = await adminService.getBestClients(start, end, limit);

            // Send response based on the result of the business logic
            if (!bestClients) {
                res.status(httpStatus.NOT_FOUND).json({ message: 'No top clients found within the specified date range' });
            } else {
                res.status(httpStatus.OK).json({ clients: bestClients });
            }
        } catch (error) {
            // Log any errors that occur during the process
            logger.error(`Error in Top Clients by Volume of Contracts - Start Date: ${req.query.start}, End Date: ${req.query.end}, Error: ${error}`);
            next(error);
        }
    }
);


module.exports = router;
