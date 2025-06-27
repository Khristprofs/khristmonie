const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const UserAccount = sequelize.define('UserAccount', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    role: {
        type: DataTypes.ENUM('primary', 'co-owner', 'authorized_user', 'secondary', 'guardian'),
        allowNull: false,
        defaultValue: 'co-owner',
    },
    relationship: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [2, 50],
        },
    },
    permissions: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {
            canDeposit: true,
            canWithdraw: true,
            canViewBalance: true
        },
    },
}, {
    tableName: 'user_accounts',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    deletedAt: 'deleted',
    paranoid: true,

    // ✅ Prevent duplicate user-account links
    indexes: [
        {
            unique: true,
            fields: ['userId', 'accountId']
        }
    ]
});

// Associations
UserAccount.associate = (models) => {
    UserAccount.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
    });

    UserAccount.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account',
    });
};

module.exports = UserAccount;