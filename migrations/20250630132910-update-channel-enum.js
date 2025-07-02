'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_enum e ON t.oid = e.enumtypid
          WHERE t.typname = 'enum_transactions_channel'
          AND e.enumlabel = 'inBank_withdrawal'
        ) THEN
          ALTER TYPE "enum_transactions_channel" ADD VALUE 'inBank_withdrawal';
        END IF;
      END$$;
    `);
  },

  async down(queryInterface, Sequelize) {
    // No down migration for enum value removal (Postgres doesn't support it)
  }
};