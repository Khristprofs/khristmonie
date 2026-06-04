module.exports = (sequelize, DataTypes) => {
    const LoanRepayment = sequelize.define('LoanRepayment', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        loanId: { type: DataTypes.INTEGER, allowNull: false },
        amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
        repaymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        repaymentMethod: {
            type: DataTypes.ENUM('bank_transfer', 'mobile_money', 'cash', 'cheque'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'successful', 'failed'),
            defaultValue: 'pending',
        },
        reference: DataTypes.STRING,
        paidBy: DataTypes.INTEGER,
    }, {
        tableName: 'loan_repayments',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        paranoid: true,
    });

    LoanRepayment.associate = (models) => {
        LoanRepayment.belongsTo(models.Loan, {
            foreignKey: 'loanId',
            as: 'loan',
        });

        LoanRepayment.belongsTo(models.User, {
            foreignKey: 'paidBy',
            as: 'payer',
        });
    };

    return LoanRepayment;
};