// migrations/XXXXXXXXXXXX-create-user.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
          notEmpty: true,
        },
      },
      middlename: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
          notEmpty: true,
        },
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isAlpha: true,
          notEmpty: true,
        },
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
          isLowercase: true,
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^[0-9]+$/, // Only digits allowed
          notEmpty: true,
        },
      },
      nin: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
          is: /^[0-9]+$/,
          notEmpty: true,
        },
      },
      role: {
        type: Sequelize.ENUM('admin', 'customer', 'bank_admin', 'staff', 'customer_service'),
        allowNull: false,
        defaultValue: 'customer',
        validate: {
          isIn: [['admin', 'customer', 'bank_admin', 'staff', 'customer_service']],
        },
      },
      DOB: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      branchId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('Users');
  }
};