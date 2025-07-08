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
    fromAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Used in transfers
    },
    toAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true, // Used in transfers
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

Transaction.associate = (models) => {
    // 🧑 User who initiated the transaction
    Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // 💳 Primary account involved in transaction
    Transaction.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account',
    });
};


module.exports = Transaction;
