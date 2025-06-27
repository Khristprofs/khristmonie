const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
        allowNull: false,
        validate: {
            isIn: [['info', 'warning', 'error', 'success']],
        },
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    channel: {
        type: DataTypes.ENUM('email', 'sms', 'push', 'whatsapp', 'in-app'),
        allowNull: false,
        defaultValue: 'in-app',
    },
    priority: {
        type: DataTypes.ENUM('low', 'normal', 'high'),
        defaultValue: 'normal',
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    readAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    referenceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    referenceType: {
        type: DataTypes.STRING,
        allowNull: true, // e.g., 'Transaction', 'Account', etc.
    },
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
});

// ✅ Association
Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
    });
};

module.exports = Notification;