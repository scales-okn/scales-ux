"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint("Rings", {
      fields: ["rid"],
      type: "unique",
      name: "unique_rid_constraint",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint("Rings", "unique_rid_constraint");
  },
};
