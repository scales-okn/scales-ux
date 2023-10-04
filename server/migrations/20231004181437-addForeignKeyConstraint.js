"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Panels", {
      fields: ["ringId"],
      type: "foreign key",
      name: "fk_panels_ring",
      references: {
        table: "Rings",
        field: "id",
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Panels", "fk_panels_ring");
  },
};
