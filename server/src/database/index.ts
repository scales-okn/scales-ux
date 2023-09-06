import Sequelize from "sequelize";
import Version from "sequelize-version";
import UserModel from "../models/User";
import PanelModel from "../models/Panel";
import NotebookModel from "../models/Notebook";
import FeedbackModel from "../models/Feedback";
import HelpTextModel from "../models/HelpText";
import RingModel from "../models/Ring";
import LogModel from "../models/Log";
import logs from "./logs";
import seeds from "./seeds";

// @ts-ignore
export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    dialectOptions:
      process.env.STAGE != "local"
        ? {
            ssl: {
              require: false,
              rejectUnauthorized: false,
            },
          }
        : {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const database = async () => {
  // Models
  try {
    const { logHooks } = logs(sequelize);

    // Create Models
    const User = UserModel(sequelize, { hooks: logHooks });
    const Panel = PanelModel(sequelize, { hooks: logHooks });
    const Notebook = NotebookModel(sequelize, { hooks: logHooks });
    const Ring = RingModel(sequelize, { hooks: logHooks });
    FeedbackModel(sequelize, { hooks: logHooks });
    HelpTextModel(sequelize, { hooks: logHooks });

    // Associate Models
    Panel.associate({
      User,
      Panel,
      Ring,
      Notebook,
    });
    Notebook.associate({
      Panel,
      Notebook,
    });
    User.associate({
      Panel,
      User,
      Ring,
      Notebook,
    });

    // Logs
    LogModel(sequelize);

    // Versioning
    new Version(Notebook, {
      sequelize,
      underscored: false,
      tableUnderscored: false,
      prefix: "Version",
      attributePrefix: "version",
    });

    new Version(Ring, {
      sequelize,
      underscored: false,
      tableUnderscored: false,
      prefix: "Version",
      attributePrefix: "version",
    });
  } catch (error) {
    console.error("@models failed to initialize!", error);
  }

  // Authentication
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // Sync
  try {
    await sequelize.sync({ force: false }); // "{ force: true }" will drop the table if it already exits
    console.log("Sync successfully!");
  } catch (error) {
    console.error("Sync Failed:", error);
  }

  // Seeds
  try {
    await seeds(sequelize);
  } catch (error) {
    console.error("Seeds failed to initialize!", error);
  }
};

export default database;
