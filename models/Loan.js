module.exports = (sequelize, DataTypes) => {
    const Loan = sequelize.define('Loan', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: { type: DataTypes.INTEGER, allowNull: false },
        amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        loanType: {
            type: DataTypes.ENUM('personal', 'home', 'auto', 'education', 'business'),
            allowNull: false,
        },
        interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
        termMonths: { type: DataTypes.INTEGER, allowNull: false },
        monthlyPayment: DataTypes.DECIMAL(15, 2),
        balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0.00,
        },
        collateral: DataTypes.STRING,
        dueDate: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'paid', 'overdue'),
            defaultValue: 'pending',
        },
        approvedAt: DataTypes.DATE,
        rejectedAt: DataTypes.DATE,
        disbursedAt: DataTypes.DATE,
        completedAt: DataTypes.DATE,
        notes: DataTypes.TEXT,
    }, {
        tableName: 'loans',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    Loan.associate = (models) => {
        Loan.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return Loan;
};