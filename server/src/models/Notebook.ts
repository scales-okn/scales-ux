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
        allowNull: false,
      },
      collaborators: {
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
      description: DataTypes.STRING,
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
  };

  return Notebook;
};
