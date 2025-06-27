const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Branch = sequelize.define('Branch', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    bankId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isAlphanumeric: true,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isNumeric: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    managerName: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'branches',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    deletedAt: 'deleted',
    paranoid: true, // enables soft delete
});

// ✅ Association defined properly (delayed until models are loaded)
Branch.associate = (models) => {
    // Belongs to a bank
    Branch.belongsTo(models.Bank, {
        foreignKey: 'bankId',
        as: 'bank',
        onDelete: 'CASCADE',
    });

    // Has many users
    Branch.hasMany(models.User, {
        foreignKey: 'branchId',
        as: 'users',
        onDelete: 'CASCADE',
    });

    // Has many accounts
    Branch.hasMany(models.Account, {
        foreignKey: 'branchId',
        as: 'accounts',
        onDelete: 'SET NULL',
    });
};

module.exports = Branch;