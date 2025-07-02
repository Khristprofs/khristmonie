const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fromAccountId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Only used in transfers
    },
    toAccountId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Only used in transfers
    },
    transactionType: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false,
        validate: {
            isIn: [['deposit', 'withdrawal', 'transfer']],
            notEmpty: true,
        },
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01,
        },
    },
    currency: {
        type: DataTypes.ENUM('USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR'),
        allowNull: false,
        defaultValue: 'NGN',
        validate: {
            isAlpha: true,
            len: [3, 3],
            isIn: [['USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR']],
        },
    },
    channel: {
        type: DataTypes.ENUM('online', 'POS', 'ATM', 'bank_transfer', 'inBank_withdrawal'),
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [['pending', 'completed', 'failed']],
        },
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    transactionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
});

// ✅ Associations
Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    Transaction.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account',
    });

    Transaction.belongsTo(models.Account, {
        foreignKey: 'fromAccountId',
        as: 'fromAccount',
    });

    Transaction.belongsTo(models.Account, {
        foreignKey: 'toAccountId',
        as: 'toAccount',
    });
};

module.exports = Transaction;
