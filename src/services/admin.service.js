const { Op } = require('sequelize');
const { Job, Contract, Profile, sequelize } = require('../model');
const logger = require('../utils/commons').logger;

/**
 * Fetches the most in-demand profession within a specified date range.
 * It calculates the profession that has the highest sum of job prices.
 *
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 * @param {string} endDate - The end date in YYYY-MM-DD format.
 * @returns {Object|null} - An object containing the most in-demand profession or null if no data is found.
 */
async function getBestProfession(startDate, endDate) {
    try {
        logger.info(`Getting best profession from ${startDate} to ${endDate}`);

        const jobs = await Job.findAll({
            order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
            group: ['Contract.Contractor.profession'],
            limit: 1,
            where: {
                paid: true,
                createdAt: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: Contract,
                    attributes: ['createdAt'],
                    include: [
                        {
                            model: Profile,
                            as: 'Contractor',
                            where: { type: 'contractor' },
                            attributes: ['profession'],
                        },
                    ],
                },
            ],
        });

        logger.info(jobs, 'Best profession result:')

        if (!jobs.length) {
            logger.warn('No best profession found for the given date range')
            return null;
        }

        return {
            profession: jobs[0].Contract.Contractor.profession,
        };
    } catch (error) {
        logger.error(`Error while getting best profession: ${error}`);
        throw error;
    }
}

/**
 * Fetches the top clients based on the volume of contracts within a specified date range.
 * It calculates the clients who have the highest sum of paid job prices.
 *
 * @param {string} startDate - The start date in YYYY-MM-DD format.
 * @param {string} endDate - The end date in YYYY-MM-DD format.
 * @param {number|null} limit - The maximum number of top clients to return.
 * @returns {Array|null} - An array of objects containing top clients' information or null if no data is found.
 */
const getBestClients = async (startDate, endDate, limit) => {
    try {
        logger.info(`Getting best clients from ${startDate} to ${endDate} with limit ${limit || 'No Limit'}`);

        const bestClients = await Job.findAll({
            attributes: [
                [sequelize.col('Contract.Client.id'), 'id'],
                [sequelize.literal('firstName|| " " || lastName'), 'fullName'],
                [sequelize.fn('sum', sequelize.col('price')), 'paid'],
            ],
            group: ['Contract.Client.id'],
            order: [[sequelize.fn('sum', sequelize.col('price')), 'DESC']],
            where: {
                paymentDate: {
                    [Op.between]: [startDate, endDate],
                },
            },
            include: [
                {
                    model: Contract,
                    required: true,
                    attributes: ['id'],
                    include: [
                        {
                            association: 'Client',
                            required: true,
                            attributes: ['id', 'firstName', 'lastName'],
                        },
                    ],
                },
            ],
            limit: limit,
        });

        if (!bestClients.length) {
            return null;
        }

        return bestClients.map(client => {
            const { id, paid } = client;
            const { firstName, lastName } = client.Contract.Client;

            return { id, firstName,lastName, paid };
        });
    } catch (error) {
        logger.error(`Error while getting best clients: ${error}`);
        throw error;
    }
};

module.exports = {
    getBestProfession,
    getBestClients,
};
