import Sequelize from "sequelize";

// @ts-ignore
const sequelize = new Sequelize(
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

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error: Error) => {
    console.error("Unable to connect to the database:", error);
  });

// force: true will drop the table if it already exits
// models.sequelize.sync({ force: true }).then(() => {
sequelize
  .sync()
  .then(() => {
    console.log("Sync succesfully!");
  })
  .catch((error: Error) => {
    console.error("Sync Failed:", error);
  });

export default sequelize;
