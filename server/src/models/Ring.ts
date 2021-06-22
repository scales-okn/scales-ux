// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const Ring = sequelize.define(
    "Ring",
    {
      contents: DataTypes.JSON,
      sourceType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      connectionDetails: DataTypes.JSON,
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    options
  );

  Ring.associate = function (models) {
    models.Ring.belongsTo(models.Notebook, { foreignKey: "id", as: "notebook" });
    models.Ring.belongsTo(models.User, { foreignKey: "id", as: "owner" });
  };

  return Ring;
};
