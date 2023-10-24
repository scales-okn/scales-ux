"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Panels", {
      fields: ["notebookId"],
      type: "foreign key",
      name: "fk_panels_notebook",
      references: {
        table: "Notebooks",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Panels", "fk_panels_notebook");
  },
};
