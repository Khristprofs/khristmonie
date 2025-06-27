// migrations/XXXXXXXXXXXX-create-profiles.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        field: 'userId'
      },
      profilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female'),
        allowNull: false,
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      civilStatus: {
        type: Sequelize.ENUM('Single', 'Married', 'Widowed', 'Separated', 'Divorced'),
        allowNull: false,
      },
      nationality: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      passwordResetToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      refreshToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      created: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add automatic update trigger for 'updated'
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_updated_timestamp
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_timestamp();
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('profiles');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_timestamp CASCADE');
  }
};