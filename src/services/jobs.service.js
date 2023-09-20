const { Op } = require('sequelize');
const { Job, Contract, Profile, sequelize } = require('../model');
const { JobError, JobInsufficientFoundError, NotFoundError } = require('../errors/errorHandler');
const logger = require('../utils/commons').logger;

/**
 * Fetches all unpaid jobs for a given profile (either as a client or contractor).
 *
 * @param {number} profileId - The ID of the profile.
 * @returns {Array} - An array of unpaid jobs for the given profile.
 */
const getUserUnpaidJobs = async (profileId) => {
    const unpaidJobs = await Job.findAll({
        where: {
            paid: {
                [Op.not]: true,
            },
        },
        include: [
            {
                attributes: [],
                model: Contract,
                required: true,
                where: {
                    [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
                    status: {
                        [Op.eq]: 'in_progress',
                    },
                },
            },
        ],
    });

    logger.info(unpaidJobs, 'Unpaid Jobs result:');
    return unpaidJobs;
};

/**
 * Pays for a job, ensuring sufficient funds, job existence, and payment permissions.
 *
 * @param {number} jobId - The ID of the job to be paid for.
 * @param {number} clientId - The ID of the client making the payment.
 * @returns {Object} - The updated job object after successful payment.
 */
const payJob = async (jobId, clientId) => {
    const paymentData = await sequelize.transaction(async (payment) => {
        const job = await Job.findOne({
            where: {
                id: jobId,
            },
            include: [
                {
                    model: Contract,
                    required: true,
                    attributes: ['ContractorId'],
                    where: {
                        ClientId: clientId,
                    },
                },
            ],
        },
        { transaction: payment }
        );

        if (!job) {
            throw new NotFoundError(`JobId: ${jobId} -> not found`);
        }

        if (job.paid) {
            throw new JobError(`JobId: ${jobId} -> it's already paid`);
        }

        const [client, contractor] = await Promise.all([
            Profile.findByPk(clientId, { transaction: payment }),
            Profile.findByPk(job.Contract.ContractorId, {
                transaction: payment,
            }),
        ]);

        if (client.balance < job.price) {
            throw new JobInsufficientFoundError('Insufficient funds');
        }

        client.balance -= job.price;
        contractor.balance += job.price;
        job.paid = true;
        job.paymentDate = new Date().toISOString();

        await Promise.all([
            client.save({ transaction: payment }),
            contractor.save({ transaction: payment }),
            job.save({ transaction: payment }),
        ]);

        return job;
    });

    logger.info(paymentData, 'Transaction submitted, result:');
    return paymentData;
};

/**
 * Validates whether the user making the request owns the specified job.
 *
 * @param {number} jobId - The ID of the job to be validated.
 * @param {number} profileId - The ID of the user making the request.
 * @param {object} transaction - The transaction object for database operations.
 * @throws {JobError} - If the user doesn't own the job.
 * @throws {NotFoundError} - If the job doesn't exist.
 */
const validateJobOwnership = async (jobId, profileId, transaction) => {
    const job = await Job.findOne({
        where: {
            id: jobId,
        },
        include: [
            {
                model: Contract,
                required: true,
                attributes: [],
                where: {
                    [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
                    status: {
                        [Op.eq]: 'in_progress',
                    },
                },
            },
        ],
    },
    { transaction });

    if (!job) {
        throw new NotFoundError(`JobId: ${jobId} -> not found`);
    }

};

module.exports = {
    getUserUnpaidJobs,
    payJob,
    validateJobOwnership,
};
