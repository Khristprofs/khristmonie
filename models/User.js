const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            notEmpty: true,
        },
    },
    middlename: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            notEmpty: true,
        },
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isAlpha: true,
            notEmpty: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true,
            isLowercase: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9]+$/, // Only digits allowed
            notEmpty: true,
        },
    },
    nin: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },
    role: {
        type: DataTypes.ENUM('admin', 'customer', 'bank_admin', 'staff', 'customer_service'),
        allowNull: false,
        defaultValue: 'customer',
        validate: {
            isIn: [['admin', 'customer', 'bank_admin', 'staff', 'customer_service']],
        },
    },
    DOB: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: true,
        },
    },
    branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
});


// ✅ Define associations here
User.associate = (models) => {
    // Belongs to a branch
    User.belongsTo(models.Branch, {
        foreignKey: 'branchId',
        as: 'branch',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
    });

    // One profile per user
    User.hasOne(models.Profile, {
        foreignKey: 'userId',
        as: 'profile',
        onDelete: 'CASCADE',
    });

    // Many-to-many with accounts
    User.belongsToMany(models.Account, {
        through: models.UserAccount,
        foreignKey: 'userId',
        otherKey: 'accountId',
        as: 'accounts',
    });

    // All transactions by the user
    User.hasMany(models.Transaction, {
        foreignKey: 'userId',
        as: 'transactions',
    });

    // Notifications for the user
    User.hasMany(models.Notification, {
        foreignKey: 'userId',
        as: 'notifications',
    });

    // Loans taken by the user
    User.hasMany(models.Loan, {
        foreignKey: 'userId',
        as: 'loans',
    });

    // Loan repayments made by the user (if paidBy is tracked)
    User.hasMany(models.LoanRepayment, {
        foreignKey: 'paidBy',
        as: 'repayments',
    });
};

module.exports = User;