const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        },
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isNumeric: true,
            len: [10, 12],
        },
    },
    accountType: {
        type: DataTypes.ENUM('savings', 'current', 'fixed', 'joint'),
        allowNull: false,
        validate: {
            isIn: [['savings', 'current', 'fixed', 'joint']],
            notEmpty: true,
        },
    },
    transferPin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: true,
            min: 0.00,
        },
    },
    currency: {
        type: DataTypes.ENUM('USD', 'NGN', 'CAD', 'EUR', 'AUD', 'GBP'),
        allowNull: false,
        defaultValue: 'USD',
        validate: {
            notEmpty: true,
            isAlpha: true,
            len: [3, 3],
            isIn: [['USD', 'NGN', 'CAD', 'EUR', 'AUD', 'GBP']],
        },
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'closed'),
        allowNull: true,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'closed']],
        },
    },
    isJoint: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, { 
    tableName: 'accounts',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
    deletedAt: 'deleted',
});

// Associations
Account.associate = (models) => {
    Account.belongsToMany(models.User, {
        through: models.UserAccount,
        foreignKey: 'accountId',
        otherKey: 'userId',
        as: 'users',
    });

    Account.hasMany(models.Transaction, {
        foreignKey: 'accountId',
        as: 'transactions',
    });

    Account.hasMany(models.Card, {
        foreignKey: 'accountId',
        as: 'cards',
    });

    Account.belongsTo(models.Branch, {
        foreignKey: 'branchId',
        as: 'branch',
    });

    Account.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });
};

module.exports = Account;