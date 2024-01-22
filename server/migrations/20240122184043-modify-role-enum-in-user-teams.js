"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("UserTeams", "role");

    await queryInterface.sequelize.query('DROP TYPE "enum_UserTeams_role";');

    await queryInterface.addColumn("UserTeams", "role", {
      type: Sequelize.ENUM("admin", "read-only"),
      allowNull: false,
      defaultValue: "read-only",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("UserTeams", "role");

    await queryInterface.sequelize.query('DROP TYPE "enum_UserTeams_role";');

    await queryInterface.addColumn("UserTeams", "role", {
      type: Sequelize.ENUM("lead", "editor", "read-only"),
      allowNull: false,
      defaultValue: "read-only",
    });
  },
};
