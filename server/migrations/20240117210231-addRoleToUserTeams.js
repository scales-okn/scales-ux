"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("UserTeams", "role", {
      type: Sequelize.ENUM("admin", "read-only"),
      allowNull: false,
      defaultValue: "read-only",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("UserTeams", "role");
  },
};
