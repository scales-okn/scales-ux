import { DataTypes } from "sequelize";
 
export const notebookVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Notebook = sequelize.define(
    "Notebook",
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: DataTypes.INTEGER,
      collaborators: {
        defaultValue: [], // Users in array can write;
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      contents: DataTypes.JSON,
      visibility: {
        type: DataTypes.ENUM,
        values: notebookVisibilityValues,
        defaultValue: "private",
      },
      parent: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    options
  );

  Notebook.associate = function (models) {
    models.Ring.belongsToMany(models.Notebook, {
      through: "NotebooksToRings",
      as: "notebooks",
      foreignKey: "ringId",
    });
    models.Notebook.belongsToMany(models.Ring, {
      through: "NotebooksToRings",
      as: "rings",
      foreignKey: "notebookId",
    });
  };
  return Notebook;
};
