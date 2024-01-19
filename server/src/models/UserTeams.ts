import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const UserTeams = sequelize.define("UserTeams", {
    role: {
      type: DataTypes.ENUM,
      values: ["lead", "editor", "read-only"],
      allowNull: false,
      defaultValue: "read-only",
    },
  });

  return UserTeams;
};
