"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE "Panels"
      SET "filters" = '[]'::json
      WHERE "filters"::text = '{}'::text;
    `);
  },

  down: async (queryInterface, Sequelize) => {},
};
