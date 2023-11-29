"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Rings", "rid_int", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE "Rings"
      SET "rid_int" = CAST("rid" AS INTEGER)
    `);

    await queryInterface.removeColumn("Rings", "rid");

    await queryInterface.renameColumn("Rings", "rid_int", "rid");

    await queryInterface.changeColumn("Rings", "rid", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Rings", "rid", "rid_int");
    await queryInterface.changeColumn("Rings", "rid_int", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.sequelize.query(`
      UPDATE "Rings"
      SET "rid" = CAST("rid_int" AS VARCHAR)
    `);
    await queryInterface.removeColumn("Rings", "rid_int");
  },
};
