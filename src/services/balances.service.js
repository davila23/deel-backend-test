const { Op } = require('sequelize');
const { Job, Contract, Profile, sequelize } = require('../model');
const { UnauthorizedDepositError, AnauthorizedError } = require('../errors/errorHandler');
const logger = require('../utils/commons').logger;

/**
 * Deposits a certain amount of money to the client's balance.
 * Validates the client and checks if the deposit amount is within limit (25% of unpaid jobs sum).
 *
 * @param {number} clientId - The ID of the client to whom the money will be deposited.
 * @param {number} amount - The amount to be deposited.
 * @returns {Object} - An object containing the client's updated profile.
 * @throws {AnauthorizedError} - Throws error if client is not found or not a type of 'client'.
 * @throws {UnauthorizedDepositError} - Throws error if the deposit amount exceeds 25% of unpaid jobs.
 */
const depositMoney = async (clientId, amount) => {
    const t = await sequelize.transaction();

    try {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new UnauthorizedDepositError('Invalid amount');
        }

        const client = await Profile.findByPk(clientId, { transaction: t });

        if (!client || client.type !== 'client') {
            throw new AnauthorizedError('Client not found');
        }

        const sum = await getClientUnpaidJobsSum(clientId);

        if (amount > sum * 0.25) {
            throw new UnauthorizedDepositError('Selected Amount exceeds the limit of 25%');
        }

        const savings = client.balance || 0;
        client.balance = savings + amount;

        await client.save({ transaction: t });

        await t.commit();

        logger.info(client.get(), 'Client status after deposit:');
        return client.get();

    } catch (error) {
        await t.rollback();
        logger.error('Error in depositMoney:', error);
        throw error;
    }
};

/**
 * Fetches the sum of unpaid jobs for a particular client.
 * This sum is used to validate the maximum deposit amount for that client.
 *
 * @param {number} clientId - The ID of the client whose unpaid jobs sum is to be calculated.
 * @returns {number} - The sum of unpaid jobs for the client.
 */
const getClientUnpaidJobsSum = async (clientId) => {
    const unpaidJobsSum = await Job.sum('price', {
        where: {
            paid: {
                [Op.not]: true,
            },
        },
        include: [
            {
                model: Contract,
                required: true,
                attributes: [],
                where: {
                    status: 'in_progress',
                    ClientId: clientId,
                },
            },
        ],
    });

    logger.info(unpaidJobsSum, 'Unpaid Jobs Sum result:');

    return unpaidJobsSum;
};

module.exports = {
    depositMoney,
    getClientUnpaidJobsSum,
};
