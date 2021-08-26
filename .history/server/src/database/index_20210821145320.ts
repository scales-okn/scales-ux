import LogModel from "../models/Log";
import NotebookModel from "../models/Notebook";
import RingModel from "../models/Ring";
import Sequelize from "sequelize";
import UserModel from "../models/User";
import logs from "./logs";
import Version from "sequelize-version";

export const sequelize = (async () => {
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
      reconnect: {
        max_retries: 999,
        onRetry: function (count) {
          console.log(`Connection lost, trying to reconnect (${count})`);
        },
      },
    }
  );

  const { logHooks } = logs(sequelize);

  try {
    // Models
    const Notebook = NotebookModel(sequelize, { hooks: logHooks });
    const User = UserModel(sequelize, { hooks: logHooks });
    const Ring = RingModel(sequelize, { hooks: logHooks });
    LogModel(sequelize);

    // Associate Models
    Notebook.associate({
      User,
      Notebook,
      Ring,
    });
    User.associate({
      Notebook,
      User,
      Ring,
    });

    const NotebookVersion = new Version(Notebook);
  } catch (error) {
    console.error("Models failed!", error);
  }

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  try {
    // "{ force: true }" will drop the table if it already exits
    await sequelize.sync({ force: false });
    console.log("Sync succesfully!");
  } catch (error) {
    console.error("Sync Failed:", error);
  }

  console.log(sequelize);

  return sequelize;
})();