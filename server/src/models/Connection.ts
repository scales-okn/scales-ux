import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const Connection = sequelize.define(
    "Connection",
    {
      sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiver: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    options
  );

  Connection.associate = (models) => {
    Connection.belongsTo(models.User, {
      foreignKey: "sender",
      as: "senderUser",
    });
    Connection.belongsTo(models.User, {
      foreignKey: "receiver",
      as: "receiverUser",
    });
    Connection.hasOne(models.Alert, {
      foreignKey: "connectionId",
      as: "alert",
    });
  };

  return Connection;
};
