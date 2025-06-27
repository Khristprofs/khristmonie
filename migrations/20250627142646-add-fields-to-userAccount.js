'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_accounts', 'role', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user_accounts', 'relationship', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('user_accounts', 'permissions', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {
        canDeposit: true,
        canWithdraw: true,
        canViewBalance: true
      }
    });

    // Optional: Prevent duplicate userId + accountId combo
    await queryInterface.addConstraint('user_accounts', {
      fields: ['userId', 'accountId'],
      type: 'unique',
      name: 'unique_user_account_pair'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('user_accounts', 'unique_user_account_pair');
    await queryInterface.removeColumn('user_accounts', 'permissions');
    await queryInterface.removeColumn('user_accounts', 'relationship');
    await queryInterface.removeColumn('user_accounts', 'role');
  }
};