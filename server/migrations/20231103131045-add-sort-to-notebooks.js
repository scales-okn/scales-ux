"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Panels", "sort", {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: {
        field: "filing_date",
        sort: "desc",
      },
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Panels", "sort");
  },
};
