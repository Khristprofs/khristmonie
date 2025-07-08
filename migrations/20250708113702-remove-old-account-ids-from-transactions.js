'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'fromAccountId');
    await queryInterface.removeColumn('transactions', 'toAccountId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'fromAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('transactions', 'toAccountId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
