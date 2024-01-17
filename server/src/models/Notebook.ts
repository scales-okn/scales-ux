import { DataTypes } from "sequelize";

export const notebookVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Notebook = sequelize.define(
    "Notebook",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      collaborators: {
        defaultValue: [],
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      sharedWith: {
        defaultValue: [],
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      visibility: {
        type: DataTypes.ENUM,
        values: notebookVisibilityValues,
        defaultValue: "private",
      },
      parent: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    options
  );

  Notebook.associate = (models) => {
    models.Notebook.belongsToMany(models.Panel, {
      through: "PanelsToNotebooks",
      as: "panels",
      foreignKey: "notebookId",
    });
    models.Panel.belongsToMany(models.Notebook, {
      through: "PanelsToNotebooks",
      as: "notebooks",
      foreignKey: "panelId",
    });
    models.Notebook.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Notebook;
};
