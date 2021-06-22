// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const NotebooksToRings = sequelize.define("NotebooksToRings", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ringId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ringVersion: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  NotebooksToRings.associate = (models) => {};

  return NotebooksToRings;
};
