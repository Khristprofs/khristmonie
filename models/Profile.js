const { DataTypes } = require('sequelize');
const sequelize = require('../db/connection');

const Profile = sequelize.define('Profile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        field: 'userId'
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true,
        },
    },
    gender: {
        type: DataTypes.ENUM('Male', 'Female'),
        allowNull: false,
    },
    occupation: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    civilStatus: {
        type: DataTypes.ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced'),
        allowNull: false,
    },
    nationality: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isAlpha: true,
        },
    },
    contactNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isNumeric: true,
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'profiles',
    timestamps: true,       // Enable automatic timestamp handling
    paranoid: true,         // Enable soft deletion
    createdAt: 'created',   // Maps to 'created' column
    updatedAt: 'updated',   // Maps to 'updated' column
    deletedAt: 'deleted',   // Maps to 'deleted' column

    // Add these indexes for better performance
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['created']
        }
    ]
});

// Relationship to User
Profile.associate = (models) => {
    Profile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
    });
};

module.exports = Profile;