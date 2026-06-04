module.exports = (sequelize, DataTypes) => {
    const UserAccount = sequelize.define('UserAccount', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        role: DataTypes.ENUM('primary', 'co-owner', 'authorized_user', 'secondary', 'guardian'),
        isPrimary: DataTypes.BOOLEAN,
    }, {
        tableName: 'user_accounts',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    UserAccount.associate = (models) => {
        UserAccount.belongsTo(models.User, { foreignKey: 'userId' });
        UserAccount.belongsTo(models.Account, { foreignKey: 'accountId' });
    };

    return UserAccount;
};