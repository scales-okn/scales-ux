// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UsersToRings = sequelize.define("UsersToRings", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ringId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  UsersToRings.associate = (models) => {};

  return UsersToRings;
};
