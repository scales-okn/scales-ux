"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("Alerts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      initiatorUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      notebookId: {
        type: Sequelize.INTEGER,
      },
      viewed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["connect", "shareNotebook", "addedToTeam", "removedFromTeam", "notebookAddedToTeam"],
        allowNull: false,
      },
      connectionId: {
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Alerts");
  },
};
