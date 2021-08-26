import LogModel from "../models/Log";
import NotebookModel from "../models/Notebook";
import RingModel from "../models/Ring";
import Sequelize from "sequelize";
import UserModel from "../models/User";
import logs from "./logs";

//@ts-ignore
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

const run = async () => {
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

  // MOCKS
  // TODO: Remove
  try {
    // const userForTesting = await sequelize.models.User.build({
    //   firstName: "test",
    //   lastName: "test",
    //   email: "test@test.test",
    //   usage: "Test",
    //   password: "Pass-word-25!@#",
    //   role: "admin"
    // });
    // await userForTesting.save();
    const newNote = await sequelize.models.Notebook.build({
      title: "test",
      userId: 1,
      collaborators: [],
      contents: '{"test" : 1}',
    });
    await newNote.save();
    console.log(newNote);
    const n = await sequelize.models.Notebook.findOne({
      where: { id: 3 },
      include: "rings",
    });
    console.log(n);
    const newRing = await sequelize.models.Ring.build({
      name: "test",
      userId: 1,
      notebookId: 3,
      sourceType: "test",
      contents: '{"test" : 1}',
      connectionDetails: '{"test" : 1}',
      description: "desc",
      visibility: "private",
    });
    await newRing.save();
    console.log(newRing);
    const r = await sequelize.models.Ring.findOne({
      where: { id: 15 },
      include: ["notebooks"],
    });
    console.log(r);
  } catch (error) {
    console.log(error);
  }
  // END MOCKS
};

export default {
  sequelize,
  run,
};
