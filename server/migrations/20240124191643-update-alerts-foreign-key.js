"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Alerts", "Alerts_notebookId_fkey");

    await queryInterface.addConstraint("Alerts", {
      fields: ["notebookId"],
      type: "foreign key",
      name: "Alerts_notebookId_fkey",
      references: {
        table: "Notebooks",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Alerts", {
      fields: ["notebookId"],
      type: "foreign key",
      name: "Alerts_notebookId_fkey",
      references: {
        table: "Notebooks",
        field: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },
};
