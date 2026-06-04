module.exports = (sequelize, DataTypes) => {
    const Account = sequelize.define('Account', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        userId: DataTypes.INTEGER,
        branchId: DataTypes.INTEGER,

        accountName: DataTypes.STRING,
        accountNumber: DataTypes.STRING,

        accountType: DataTypes.ENUM('savings', 'current', 'fixed', 'joint'),

        transferPin: DataTypes.STRING,

        balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0,
        },

        currency: DataTypes.ENUM('USD', 'NGN', 'EUR', 'GBP'),
        status: DataTypes.ENUM('active', 'inactive', 'closed'),

        isJoint: DataTypes.BOOLEAN,
    }, {
        tableName: 'accounts',
        timestamps: true,
        paranoid: true,
    });

    Account.associate = (models) => {
        Account.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Account.belongsTo(models.Branch, { foreignKey: 'branchId', as: 'branch' });

        Account.hasMany(models.Transaction, {
            foreignKey: 'accountId',
            as: 'transactions',
        });
    };

    return Account;
};