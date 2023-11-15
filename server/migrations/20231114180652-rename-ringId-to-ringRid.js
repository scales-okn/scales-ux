"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Panels", "ringId", "ringRid");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Panels", "ringRid", "ringId");
  },
};
