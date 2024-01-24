import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const Alert = sequelize.define(
    "Alert",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      initiatorUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      notebookId: {
        type: DataTypes.INTEGER,
      },
      connectionId: {
        type: DataTypes.INTEGER,
      },
      teamId: {
        type: DataTypes.INTEGER,
      },
      viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["connect", "shareNotebook", "addedToTeam", "removedFromTeam", "notebookAddedToTeam"],
        allowNull: false,
      },
    },
    options
  );

  Alert.associate = (models) => {
    Alert.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Alert.belongsTo(models.User, {
      foreignKey: "initiatorUserId",
      as: "initiatorUser",
    });
    Alert.belongsTo(models.Connection, {
      foreignKey: "connectionId",
      as: "connection",
    });
    Alert.belongsTo(models.Team, {
      foreignKey: "teamId",
      as: "team",
    });
    Alert.belongsTo(models.Notebook, {
      foreignKey: "notebookId",
      as: "notebook",
      onDelete: "CASCADE",
    });
  };

  return Alert;
};
