const httpStatus = require('http-status');
const logger = require('../utils/commons').logger;  

const UNAUTHORIZED_MESSAGE = 'Error: Try adding the profile_id in the headers';

const getProfile = async (req, res, next) => {
    try {
        const { Profile } = req.app.get('models');
        const profileId = req.get('profile_id');

        if (!profileId) {
            logger.warn('No profile_id provided in the headers');
            return next({ status: httpStatus.UNAUTHORIZED, message: UNAUTHORIZED_MESSAGE });
        }

        const profile = await Profile.findOne({ where: { id: profileId } });

        if (!profile) {
            logger.warn(`No profile found for id ${profileId}`);
            return next({ status: httpStatus.UNAUTHORIZED, message: UNAUTHORIZED_MESSAGE });
        }

        req.profile = profile;
        next();
    } catch (error) {
        logger.error('Error in getProfile middleware:', error);
        next({ status: httpStatus.INTERNAL_SERVER_ERROR, message: 'Internal Server Error' });
    }
}

module.exports = { getProfile };
