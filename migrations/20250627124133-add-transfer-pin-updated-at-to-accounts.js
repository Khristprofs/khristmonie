'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('accounts', 'transferPin', {
      type: Sequelize.DATE,
      allowNull: true, // Initially allow null for existing records
      defaultValue: null
    });

    // Set default value for existing records
    await queryInterface.sequelize.query(`
      UPDATE accounts
      SET "transferPin" = NOW()
      WHERE "transferPin" IS NOT NULL
    `);

    // Change to NOT NULL after setting defaults
    await queryInterface.changeColumn('accounts', 'transferPin', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('accounts', 'transferPinUpdatedAt');
  }
};