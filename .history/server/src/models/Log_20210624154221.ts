// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Log = sequelize.define(
    "Log",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      resource: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      resourceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      actionType: DataTypes.ENUM("create", "update", "delete"),
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      previousValues: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      currentValues: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    { timestamps: false }
  );

  return Log;
};
