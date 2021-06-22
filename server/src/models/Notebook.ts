// @ts-nocheck
import { DataTypes } from "sequelize";

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
        defaultValue: [],
        type: DataTypes.ARRAY(DataTypes.INTEGER),
      },
      contents: DataTypes.JSON,
      rings: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: [],
      },
      visibility: {
        type: DataTypes.STRING || DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: "public", // "private"
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
    models.Notebook.belongsTo(models.User, { foreignKey: "id", as: "owner" });
    models.Notebook.hasMany(models.Ring, {
      foreignKey: "notebookId",
      as: "rings",
    });
  };

  return Notebook;
};
