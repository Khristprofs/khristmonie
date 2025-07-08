'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      accountId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      fromAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      toAccountNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      transactionType: {
        type: Sequelize.ENUM('deposit', 'withdrawal', 'transfer'),
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },

      currency: {
        type: Sequelize.ENUM('USD', 'EUR', 'GBP', 'NGN', 'KES', 'ZAR'),
        allowNull: false,
        defaultValue: 'NGN',
      },

      channel: {
        type: Sequelize.ENUM(
          'online',
          'POS',
          'ATM',
          'bank_transfer',
          'inBank_withdrawal',
          'atm_withdrawal',
          'pos_withdrawal',
          'online_withdrawal'
        ),
        allowNull: true,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
      },

      reference: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      transactionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      created: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};
