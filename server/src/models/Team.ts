import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const Team = sequelize.define(
    "Team",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    options
  );

  Team.associate = (models) => {
    Team.belongsToMany(models.User, {
      through: "UserTeams",
      as: "users",
      foreignKey: "teamId",
    });
    Team.hasMany(models.Notebook, {
      foreignKey: "teamId",
      as: "notebooks",
    });
    Team.hasMany(models.Alert, {
      foreignKey: "teamId",
      as: "alerts",
    });
  };

  return Team;
};
