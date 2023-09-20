const { Op } = require('sequelize');
const { Contract } = require('../model');
const logger = require('../utils/commons').logger;

/**
 * Fetches all non-terminated contracts for a given user (either as a client or contractor).
 *
 * @param {number} userId - The ID of the user whose contracts will be fetched.
 * @returns {Array} - An array containing all non-terminated contracts for the user.
 */
const getNonTerminatedUserContracts = async (userId) => {
    const contracts = await Contract.findAll({
        where: {
            [Op.or]: [{ ContractorId: userId }, { ClientId: userId }],
            status: {
                [Op.ne]: 'terminated',
            },
        },
    });

    logger.info(contracts, 'Non-terminated Contracts result:');
    return contracts;
};

/**
 * Fetches a contract by its ID and ensures that it is either for the client or the contractor represented by userId.
 *
 * @param {number} id - The ID of the contract to fetch.
 * @param {number} userId - The ID of the user (either client or contractor) related to the contract.
 * @returns {Object|null} - The contract object if found, or null otherwise.
 */
const getContractById = async (id, userId) => {
    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                {
                    ClientId: userId,
                },
                {
                    ContractorId: userId,
                },
            ],
        },
    });

    logger.info(contract, 'Contract by ID result:');
    return contract;
};

module.exports = {
    getNonTerminatedUserContracts,
    getContractById,
};
