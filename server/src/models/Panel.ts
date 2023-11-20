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
      ringRid: DataTypes.INTEGER,
      ringVersion: DataTypes.INTEGER,
      filters: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      results: DataTypes.JSON,
      contents: DataTypes.JSON,
      sort: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      analysis: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      page: DataTypes.INTEGER,
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
