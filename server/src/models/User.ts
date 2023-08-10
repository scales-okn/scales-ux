import { DataTypes } from "sequelize";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sesMailer";
// import mailer from "../services/mail";

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

      const recipientName = `${firstName} ${lastName}`;
      sendEmail({
        emailSubject: `Welcome to SCALES, ${recipientName}!`,
        recipientEmail: email,
        templateName: "confirmAccount",
        recipientName,
        templateArgs: {
          url: `${process.env.UX_CLIENT_MAILER_URL}/verify-email/${emailVerificationToken}`,
        },
      });

      await user.save();
    } catch (error) {
      console.warn({ error });
    }
  });

  return User;
};
