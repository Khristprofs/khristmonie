const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Bank = sequelize.define('Bank', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: { notEmpty: true },
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
        // validate: {
        //     notEmpty: true,
        //     isUrl: true,
        // },
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
        validate: { notEmpty: true },
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { notEmpty: true },
    }
}, {
    tableName: 'banks',
    timestamps: true,
    createdAt: 'created',
    updatedAt: 'updated',
    deletedAt: 'deleted',
    paranoid: true,
});

// ✅ Define associations in a static method
Bank.associate = (models) => {
    Bank.hasMany(models.Branch, {
        foreignKey: 'bankId',
        as: 'branches',
        onDelete: 'CASCADE',
    });
};

module.exports = Bank;