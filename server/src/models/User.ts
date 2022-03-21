import { DataTypes, Sequelize } from "sequelize";
import jwt from "jsonwebtoken";
import mailTransport from "../services/mail";

export interface User {
  id: number;
  role: string;
  [key: string]: any;
}

export const userRoleValues = ["user", "admin"];

export default (sequelize, options) => {
  const User = sequelize.define(
    "User",
    {
      approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
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
      emailVerificationToken: DataTypes.STRING,
      emailIsVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      usage: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      passwordResetToken: DataTypes.STRING,
      role: {
        type: DataTypes.ENUM,
        values: userRoleValues,
        defaultValue: "user",
      },
    },
    options
  );

  User.associate = (models) => {
    models.User.hasMany(models.Panel, {
      foreignKey: "userId",
      as: "panels",
    });
    models.User.hasMany(models.Notebook, {
      foreignKey: "userId",
      as: "notebooks",
    });
    models.User.hasMany(models.Ring, {
      foreignKey: "userId",
      as: "rings",
    });
  };

  User.addHook("afterCreate", "verifyEmail", async (user) => {
    try {
      const { firstName, lastName, email } = user;
      const emailVerificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );
      user.emailVerificationToken = emailVerificationToken;
      await user.save();
      mailTransport.sendMail(
        {
          from: process.env.SENDGRID_FROM_SENDER,
          to: `${firstName} ${lastName} <${email}>`,
          subject: "Please confirm your Email account!",
          html: `Hello, <br>
          Please Click on the link to verify your email. <br>
          <a href="${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}">Click here to verify</a>`,
        },
        (error, info) => console.log(error, info)
      );
      await user.save();
    } catch (error) {
      console.log({ error });
    }
  });

  User.addHook("afterBulkUpdate", "sendUserApproveEmail", async (updated) => {
    try {
      const { fields, attributes, where } = updated;

      if (fields.includes("approved") && attributes?.approved === true) {
        const user = await User.findOne({ where });
        const { firstName, lastName, email } = user.dataValues;
        mailTransport.sendMail(
          {
            from: process.env.SENDGRID_FROM_SENDER,
            to: `${firstName} ${lastName} <${email}>`,
            subject: "Your account was approved!",
            html: `Hello, <br> 
          Your account was approved. You can sign in <a href="${process.env.CLIENT_URL}/sign-in">here</a>.`,
          },
          (error, info) => console.log(error, info)
        );
      }
    } catch (error) {
      console.log({ error });
    }
  });

  return User;
};
