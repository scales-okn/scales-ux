import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      body: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    options
  );

  return Feedback;
};
