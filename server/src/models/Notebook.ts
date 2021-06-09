// @ts-nocheck
import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Notebook = sequelize.define("Notebook", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Notebook;
};

// TODO: Asscociate with User
// createby: User
// owner: User
// collaborators: User
// viewer: public || private (me and User)
