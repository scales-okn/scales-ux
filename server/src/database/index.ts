//@ts-nocheck
import Sequelize, { DataTypes } from "sequelize";
import randomString from "randomstring";
import mailTransport from "../services/mail";

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

// User Model
const User = sequelize.define("User", {
  approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  usage: DataTypes.STRING,
  emailVerificationCode: DataTypes.STRING,
  emailIsVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
  },
});

User.addHook("afterCreate", "verifyEmail", async (user) => {
  try {
    const emailVerificationCode = randomString.generate({
      length: 64,
    });
    user.emailVerificationCode = emailVerificationCode;
    await user.save();
    const { firstName, lastName, email } = user;
    mailTransport.sendMail(
      {
        from: process.env.SENDGRID_FROM_SENDER,
        to: `${firstName} ${lastName} <${email}>`,
        subject: "Please confirm your Email account!",
        html: `Hello, <br> 
        Please Click on the link to verify your email. <br>
        <a href="${process.env.CLIENT_URL}/verify/email/${emailVerificationCode}">Click here to verify</a>`,
      },
      (error, info) => console.log(error, info)
    );
  } catch (error) {
    console.log(error);
  }

  user.save((error) => console.log(error));
});

// Notebook Model
const Notebook = sequelize.define("Notebook", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// TODO: Asscociate with User
// createby: User
// owner: User
// collaborators: User
// viewer: public || private (me and User)

const initialize = async () => {
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
  models: {
    User,
    Notebook,
  },
  initialize,
};
