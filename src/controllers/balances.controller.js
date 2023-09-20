const { Router, body, logger, httpStatus, param , query} = require('../utils/commons');
const balancesService = require('../services/balances.service');
const { validationResult} = require('express-validator');
const {sequelize} = require('../model')

const router = new Router();

/**
 * @swagger
 * /deposit/{userId}:
 *   post:
 *     summary: Make a Deposit for a User
 *     description: This endpoint allows you to make a deposit to a specific user's account. 
 *                  The userId is passed as a parameter in the URL, and the amount to deposit is sent in the request body.
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: ID of the user for whom the deposit is being made.
 *         required: true
 *         schema:
 *           type: integer
 *       - name: amount
 *         in: body
 *         description: Amount to deposit into the user's account. Must be positive.
 *         required: true
 *         schema:
 *           type: number
 *           format: double
 *     responses:
 *       200:
 *         description: Deposit was successful and returns the updated balance
 *       400:
 *         description: Invalid input or parameters
 *       500:
 *         description: Internal server error or transaction rollback
 */
router.post('/deposit/:userId', [
    // Validate userId and amount to make sure they conform to the required formats
    param('userId').exists().isInt().withMessage('userId must be an integer and is required'),
    body('amount').exists().isFloat({ gt: 0 }).withMessage('A positive amount is required for the deposit')
], async (req, res) => {
    let transaction;
    try {
        // Extract userId from parameters and amount from body
        const { userId } = req.params;
        const { amount } = req.body;
        
        // Log the incoming request for deposit with userId and amount
        logger.info(`New Deposit Request - UserId: ${userId}, Amount: ${amount}`);

        // Validate the request input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ errors: errors.array() });
        }

        // Initialize transaction
        transaction = await sequelize.transaction()

        try {
            // Execute deposit business logic and commit the transaction
            const balance = await balancesService.depositMoney(userId, amount, transaction);
            await transaction.commit();

            // Respond with the new balance
            res.status(httpStatus.OK).json({ new_balance: balance });
        } catch (innerError) {
            // Log transaction failure and rollback
            logger.error(`Transaction Rollback Due to Error: ${innerError}`);
            await transaction.rollback();
            throw innerError;
        }

    } catch (error) {
        // Log the error and send a 500 Internal Server Error response
        logger.error(`Error During Deposit Operation - UserId: ${req.params.userId}, Error: ${error}`);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Internal error during deposit operation', error });
    }
});


module.exports = router;
