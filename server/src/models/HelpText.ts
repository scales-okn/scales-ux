import { DataTypes } from "sequelize";

export default (sequelize, options) => {
  const HelpText = sequelize.define(
    "HelpText",
    {
      slug: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.STRING,
      },
      examples: {
        type: DataTypes.STRING,
      },
      options: {
        type: DataTypes.STRING,
      },
      links: {
        type: DataTypes.STRING,
      },
    },
    options
  );

  return HelpText;
};
