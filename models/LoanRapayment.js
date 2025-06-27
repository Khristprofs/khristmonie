const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const LoanRepayment = sequelize.define('LoanRepayment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    loanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01,
        },
    },
    repaymentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    repaymentMethod: {
        type: DataTypes.ENUM('bank_transfer', 'mobile_money', 'cash', 'cheque'),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'successful', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    reference: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paidBy: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional, in case someone else pays on borrower's behalf
    },
}, {
    tableName: 'loan_repayments',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
});

// ✅ Associations
LoanRepayment.associate = (models) => {
    LoanRepayment.belongsTo(models.Loan, {
        foreignKey: 'loanId',
        as: 'loan',
        onDelete: 'CASCADE',
    });

    LoanRepayment.belongsTo(models.User, {
        foreignKey: 'paidBy',
        as: 'payer',
        onDelete: 'SET NULL',
    });
};

module.exports = LoanRepayment;