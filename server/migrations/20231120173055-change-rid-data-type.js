"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new INTEGER column for the converted 'rid' values
    await queryInterface.addColumn("Rings", "rid_int", {
      type: Sequelize.INTEGER,
      allowNull: true, // Allow NULL values temporarily during migration
    });

    // Update the 'rid_int' column with converted values
    await queryInterface.sequelize.query(`
      UPDATE "Rings"
      SET "rid_int" = CAST("rid" AS INTEGER)
    `);

    // Remove the old 'rid' column
    await queryInterface.removeColumn("Rings", "rid");

    // Rename the 'rid_int' column to 'rid'
    await queryInterface.renameColumn("Rings", "rid_int", "rid");

    // Modify the 'rid' column to disallow NULL values
    await queryInterface.changeColumn("Rings", "rid", {
      type: Sequelize.INTEGER,
      allowNull: false, // Restore allowNull to false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // If you need to rollback the migration, you can revert the changes here
    // This rollback script assumes you have a backup of your data
    await queryInterface.renameColumn("Rings", "rid", "rid_int");
    await queryInterface.changeColumn("Rings", "rid_int", {
      type: Sequelize.STRING,
      allowNull: false, // Modify as needed
    });
    await queryInterface.sequelize.query(`
      UPDATE "Rings"
      SET "rid" = CAST("rid_int" AS VARCHAR)
    `);
    await queryInterface.removeColumn("Rings", "rid_int");
  },
};
