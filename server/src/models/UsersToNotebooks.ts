// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UsersToNotebooks = sequelize.define("UsersToNotebooks", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notebookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  UsersToNotebooks.associate = (models) => {};

  return UsersToNotebooks;
};
