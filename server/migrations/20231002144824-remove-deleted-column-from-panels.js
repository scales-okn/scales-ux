"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'deleted' column from the 'Panels' table
    await queryInterface.removeColumn("Panels", "deleted");
  },

  down: async (queryInterface, Sequelize) => {},
};
