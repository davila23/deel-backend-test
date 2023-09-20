const Sequelize = require('./utils/commons').Sequelize; 

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite3'
});

// Define Profile model
class Profile extends Sequelize.Model {
}

// Initialize Profile model with its fields
Profile.init(
    {
        firstName: {
            type: Sequelize.STRING,
            allowNull: false  
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false  
        },
        profession: {
            type: Sequelize.STRING,
            allowNull: false  
        },
        balance: {
            type: Sequelize.DECIMAL(12, 2)
        },
        type: {
            type: Sequelize.ENUM('client', 'contractor') 
        }
    },
    {
        sequelize,
        modelName: 'Profile'
    }
);

// Define Contract model
class Contract extends Sequelize.Model {
}

// Initialize Contract model with its fields
Contract.init(
    {
        terms: {
            type: Sequelize.TEXT,
            allowNull: false  
        },
        status: {
            type: Sequelize.ENUM('new', 'in_progress', 'terminated')
        }
    },
    {
        sequelize,
        modelName: 'Contract'
    }
);

// Define Job model
class Job extends Sequelize.Model {
}

// Initialize Job model with its fields
Job.init(
    {
        description: {
            type: Sequelize.TEXT,
            allowNull: false  
        },
        price: {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false  
        },
        paid: {
            type: Sequelize.BOOLEAN,
            default: false  
        },
        paymentDate: {
            type: Sequelize.DATE
        }
    },
    {
        sequelize,
        modelName: 'Job'
    }
);

// Define relationships between models
Profile.hasMany(Contract, {as: 'Contractor', foreignKey: 'ContractorId'});
Contract.belongsTo(Profile, {as: 'Contractor'});
Profile.hasMany(Contract, {as: 'Client', foreignKey: 'ClientId'});
Contract.belongsTo(Profile, {as: 'Client'});
Contract.hasMany(Job);
Job.belongsTo(Contract);

// Export models and Sequelize instance
module.exports = {
    sequelize,
    Profile,
    Contract,
    Job
};
