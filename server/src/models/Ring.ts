import { DataTypes } from "sequelize";

export const ringVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Ring = sequelize.define(
    "Ring",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      version: {
        type: DataTypes.INTEGER,
        noUpdate: true,
        defaultValue: 1,
      },
      schemaVersion: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      dataSource: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      ontology: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM,
        values: ringVisibilityValues,
        defaultValue: "private",
      },
    },
    options
  );
  
  return Ring;
};
