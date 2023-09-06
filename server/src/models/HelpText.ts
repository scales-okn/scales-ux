import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const HelpText = sequelize.define(
    "HelpText",
    {
      slug: {
        type: DataTypes.TEXT,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      examples: {
        type: DataTypes.TEXT,
      },
      options: {
        type: DataTypes.TEXT,
      },
      links: {
        type: DataTypes.TEXT,
      },
    },
    options
  );

  return HelpText;
};
