//@ts-nocheck
import Sequelize from "sequelize";
import User from "../models/User";
import Notebook from "../models/Notebook";

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const initialize = async () => {
  try {
    User(sequelize);
    Notebook(sequelize);
  } catch (error) {
    console.error("Models failed to initialize!", error);
  }
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  try {
    // force: true will drop the table if it already exits
    await sequelize.sync({ force: false });
    console.log("Sync succesfully!");
  } catch (error) {
    console.error("Sync Failed:", error);
  }
};

export default {
  sequelize,
  initialize,
};
