"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE "Panels"
      SET "analysis" = '{}'::jsonb
      WHERE "analysis"::jsonb = '[]'::jsonb
    `);
  },

  down: async (queryInterface, Sequelize) => {},
};
