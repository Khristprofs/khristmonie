module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        type: {
            type: DataTypes.ENUM('info', 'warning', 'error', 'success'),
            allowNull: false,
        },
        title: DataTypes.STRING,
        message: DataTypes.TEXT,
        channel: {
            type: DataTypes.ENUM('email', 'sms', 'push', 'whatsapp', 'in-app'),
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
        readAt: DataTypes.DATE,
        sentAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        referenceId: DataTypes.INTEGER,
        referenceType: DataTypes.STRING,
    }, {
        tableName: 'notifications',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Notification;
};