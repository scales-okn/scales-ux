"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add teamId to Alerts
    await queryInterface.addColumn("Alerts", "teamId", {
      type: Sequelize.INTEGER,
      references: {
        model: "Teams",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // await queryInterface.removeColumn("Alerts", "teamId");
  },
};
