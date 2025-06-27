const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Card = sequelize.define('Card', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cardNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isCreditCard: true,
        },
    },
    lastFourDigits: {
        type: DataTypes.STRING(4),
        allowNull: false,
        validate: {
            isNumeric: true,
            len: [4, 4],
        },
    },
    cardHolderName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cardType: {
        type: DataTypes.ENUM('Visa', 'MasterCard', 'American Express', 'Discover'),
        allowNull: false,
    },
    cardBrand: {
        type: DataTypes.STRING, // e.g. Platinum, Debit, Prepaid
        allowNull: true,
    },
    pin: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [4, 6], // hashed PIN recommended
        },
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    cvv: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [3, 4],
            isNumeric: true,
        },
    },
    isVirtual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked'),
        allowNull: false,
        defaultValue: 'active',
    },
    issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    blockedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'cards',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
});

// ✅ Association
Card.associate = (models) => {
    Card.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });
};

module.exports = Card;