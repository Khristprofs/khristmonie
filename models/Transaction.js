module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: DataTypes.INTEGER,
        accountId: DataTypes.INTEGER,
        transactionType: DataTypes.ENUM('deposit','withdrawal','transfer'),
        amount: DataTypes.DECIMAL(15,2),
        currency: {
            type: DataTypes.ENUM('USD','EUR','GBP','NGN','KES','ZAR'),
            defaultValue: 'NGN',
        },
        status: {
            type: DataTypes.ENUM('pending','completed','failed'),
            defaultValue: 'pending',
        },
        reference: { type: DataTypes.STRING, unique: true },
        transactionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    }, {
        tableName: 'transactions',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        Transaction.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
    };

    return Transaction;
};