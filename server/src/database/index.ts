import Sequelize from "sequelize";
import Version from "sequelize-version";
import UserModel from "../models/User";
import PanelModel from "../models/Panel";
import NotebookModel from "../models/Notebook";
import RingModel from "../models/Ring";
import LogModel from "../models/Log";
import logs from "./logs";

// @ts-ignore
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

const database = async () => {
  try {
    const { logHooks } = logs(sequelize);

    // Models
    const User = UserModel(sequelize, { hooks: logHooks });
    const Panel = PanelModel(sequelize, { hooks: logHooks });
    const Notebook = NotebookModel(sequelize, { hooks: logHooks });
    const Ring = RingModel(sequelize, { hooks: logHooks });

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
    new Version(Panel, {
      sequelize,
      underscored: false, 
      tableUnderscored: false,
      prefix: "Version",
      attributePrefix: "version"
    });
  } catch (error) {
    console.error("Models failed to initialize!", error);
  }

  // Authentification
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  // Sync
  try {
    await sequelize.sync({ force: false }); // "{ force: true }" will drop the table if it already exits
    console.log("Sync succesfully!");
  } catch (error) {
    console.error("Sync Failed:", error);
  }

  // MOCKS
  // TODO: Remove
  try {
    const userForTesting = await sequelize.models.User.build({
      firstName: "test",
      lastName: "test",
      email: "test@test.test",
      usage: "Test",
      password: "Pass-word-25!@#",
      role: "admin"
    });
    await userForTesting.save();

    const notebookForTesting = await sequelize.models.Notebook.build({ 
      title: "test",
      userId: 1,     
    });
    await notebookForTesting.save();

 
    const user = await sequelize.models.Panel.findOne({
      where: { id: 1 },
      include: "rings",
    });

    console.log(user);
    const newRing = await sequelize.models.Ring.build({
      name: "test",
      userId: 1,
      panelId: 1,
      sourceType: "test",
      contents: '{"test" : 1}', 
      connectionDetails: '{"test" : 1}',
      description: "desc",
      visibility: "private",
    });
    await newRing.save(); 
    console.log(newRing);
    const userwithRings = await sequelize.models.Ring.findOne({
      where: { id: 15 },
      include: ["panels"],
    });
    console.log(userwithRings);

    const panelForTesting = await sequelize.models.Panel.build({ 
      title: "test",
      userId: 1,
      notebookId: 1,
      collaborators: [],
      contents: '{"test" : 1}',
      ringId: 1,
    });
    await panelForTesting.save();
  } catch (error) {
    console.log(error);
  }
  // END MOCKS
};

export default database;
