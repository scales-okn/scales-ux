"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Rings", "dataSourceDiff", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Rings", "ontologyDiff", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Rings", "dataSourceDiff");
    await queryInterface.removeColumn("Rings", "ontologyDiff");
  },
};
