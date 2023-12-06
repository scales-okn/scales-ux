module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Rings", "dataSourceDiff", {
      type: Sequelize.TEXT,
    });
    await queryInterface.changeColumn("Rings", "ontologyDiff", {
      type: Sequelize.TEXT,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Rings", "dataSourceDiff", {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn("Rings", "ontologyDiff", {
      type: Sequelize.STRING,
    });
  },
};
