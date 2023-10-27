"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const orphanedPanels = await queryInterface.sequelize.query(`
      SELECT "id" FROM "Panels"
      WHERE "notebookId" NOT IN (SELECT "id" FROM "Notebooks");
    `);

    await queryInterface.bulkDelete("Panels", {
      id: orphanedPanels[0].map((panel) => panel.id),
    });
  },

  down: async (queryInterface, Sequelize) => {},
};
