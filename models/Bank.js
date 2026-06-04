module.exports = (sequelize, DataTypes) => {
    const Bank = sequelize.define('Bank', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        logo: DataTypes.STRING,
        code: {
            type: DataTypes.STRING,
            unique: true,
        },
        address: DataTypes.STRING,
        country: DataTypes.STRING,
    }, {
        tableName: 'banks',
        timestamps: true,
        paranoid: true,
    });

    Bank.associate = (models) => {
        Bank.hasMany(models.Branch, { foreignKey: 'bankId', as: 'branches' });
    };

    return Bank;
};