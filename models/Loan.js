const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Loan = sequelize.define('Loan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0.01 },
    },
    loanType: {
        type: DataTypes.ENUM('personal', 'home', 'auto', 'education', 'business'),
        allowNull: false,
        validate: {
            isIn: [['personal', 'home', 'auto', 'education', 'business']],
        },
    },
    interestRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: { isDecimal: true, min: 0 },
    },
    termMonths: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { isInt: true, min: 1 },
    },
    monthlyPayment: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: { isDecimal: true },
    },
    balance: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0.00,
        validate: { isDecimal: true, min: 0 },
    },
    collateral: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'paid', 'overdue'),
        allowNull: false,
        defaultValue: 'pending',
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    rejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    disbursedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'loans',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    paranoid: true,
});

// ✅ Associations
Loan.associate = (models) => {
    Loan.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
    });
};

module.exports = Loan;