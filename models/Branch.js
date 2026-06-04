module.exports = (sequelize, DataTypes) => {
    const Branch = sequelize.define('Branch', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        bankId: DataTypes.INTEGER,
        name: DataTypes.STRING,
        code: {
            type: DataTypes.STRING,
            unique: true,
        },
        address: DataTypes.STRING,
        phone: DataTypes.STRING,
        email: DataTypes.STRING,
        city: DataTypes.STRING,
        managerName: DataTypes.STRING,
    }, {
        tableName: 'branches',
        timestamps: true,
        paranoid: true,
    });

    Branch.associate = (models) => {
        Branch.belongsTo(models.Bank, { foreignKey: 'bankId', as: 'bank' });
        Branch.hasMany(models.User, { foreignKey: 'branchId', as: 'users' });
        Branch.hasMany(models.Account, { foreignKey: 'branchId', as: 'accounts' });
    };

    return Branch;
};