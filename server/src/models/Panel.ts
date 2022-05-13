import { DataTypes } from "sequelize";

export const panelVisibilityValues = ["public", "private"];

export default (sequelize, options) => {
  const Panel = sequelize.define(
    "Panel",
    {
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notebookId: DataTypes.INTEGER,
      ringId: DataTypes.INTEGER,
      ringVersion: DataTypes.INTEGER,
      filters: DataTypes.JSON,
      results: DataTypes.JSON,
      contents: DataTypes.JSON,
      analysis: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    options
  );

  Panel.associate = (models) => {
    models.Ring.belongsToMany(models.Panel, {
      through: "PanelsToRings",
      as: "panels",
      foreignKey: "ringId",
    });
    models.Panel.belongsToMany(models.Ring, {
      through: "PanelsToRings",
      as: "rings",
      foreignKey: "panelId",
    });
  };

  return Panel;
};
