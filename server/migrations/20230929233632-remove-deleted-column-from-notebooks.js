"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'deleted' column from the 'Notebooks' table
    await queryInterface.removeColumn("Notebooks", "deleted");
  },

  down: async (queryInterface, Sequelize) => {},
};
