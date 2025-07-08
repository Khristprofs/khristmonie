'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'fromAccountNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('transactions', 'toAccountNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'fromAccountNumber');
    await queryInterface.removeColumn('transactions', 'toAccountNumber');
  }
};
