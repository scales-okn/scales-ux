//@ts-nocheck
import Sequelize from "sequelize";
import UserModel from "../models/User";
import NotebookModel from "../models/Notebook";
import RingModel from "../models/Ring";
import LogModel from "../models/Log";
import logs from "./logs";

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

const { logHooks } = logs(sequelize);

const initialize = async () => {
  try {
    // Models
    const Notebook = NotebookModel(sequelize, { hooks: logHooks });
    const User = UserModel(sequelize, { hooks: logHooks });
    const Ring = RingModel(sequelize, { hooks: logHooks });
    const Log = LogModel(sequelize);

    // Associate Models
    try {
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
    } catch (error) {
      console.log(error);
    }
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

  // TODO: Remove, only for testing;
  try {
    const newNote = await sequelize.models.Notebook.build({
      title: "test",
      userId: 1,
      collaborators: [],
      contents: '{"test" : 1}',
    });
    await newNote.save();
    console.log(newNote);
    const user = await sequelize.models.User.findOne({
      where: { id: 1 },
      include: "notebooks",
    });
    console.log(user);

    const newRing = await sequelize.models.Ring.build({
      name: "test",
      userId: 1,
      notebookId: 2,
      sourceType: "test",
      contents: '{"test" : 1}',
      connectionDetails: '{"test" : 1}',
      description: "desc",
      visibility: "private",
    });
    await newRing.save();
    console.log(newRing);
    const userwithRings = await sequelize.models.User.findOne({
      where: { id: 1 },
      include: ["rings", "notebooks"],
    });
    console.log(userwithRings);
  } catch (error) {
    console.log(error);
  }
  // END
};

export default {
  sequelize,
  initialize,
};
