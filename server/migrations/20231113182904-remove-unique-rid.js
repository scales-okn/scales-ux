"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the existing unique constraint
    await queryInterface.removeConstraint("Rings", "unique_rid_constraint");

    // Add a new unique constraint on both rid and version columns
    await queryInterface.addConstraint("Rings", {
      type: "unique",
      fields: ["rid", "version"],
      name: "unique_rid_version_constraint",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new unique constraint
    await queryInterface.removeConstraint("Rings", "unique_rid_version_constraint");

    // Add back the original unique constraint
    await queryInterface.addConstraint("Rings", {
      type: "unique",
      fields: ["rid"],
      name: "unique_rid_constraint",
    });
  },
};
