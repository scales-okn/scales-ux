import { DataTypes } from "sequelize";
import sequelize from "../db/sequelize";

const { STRING } = DataTypes;

const User = sequelize.define(
  "User",
  {
    email: STRING,
    password: STRING,
  }
);

export default User;

// TODO: User fields
