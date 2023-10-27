import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sesMailer";
import { sequelize } from "../database";
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

  return User;
};

const verifyEmail = async (user, isAdmin, password = null) => {
  try {
    const { firstName, lastName, email } = user;
    const emailVerificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXP,
    });
    user.emailVerificationToken = emailVerificationToken;
    await user.save();

    const recipientName = `${firstName} ${lastName}`;
    const sharedEmailArgs = {
      emailSubject: `Welcome to SCALES, ${recipientName}!`,
      recipientEmail: email,
      recipientName,
    };

    // TODO: refactor to use RBAC once session concept more fleshed out
    if (isAdmin) {
      user.update({
        emailIsVerified: true,
      });

      sendEmail({
        ...sharedEmailArgs,
        templateName: "confirmAccountAdminCreated",
        templateArgs: {
          url: `${process.env.UX_CLIENT_MAILER_URL}/sign-in`,
          email: user.email,
          password,
        },
      });
    } else {
      sendEmail({
        ...sharedEmailArgs,
        templateName: "confirmAccount",
        templateArgs: {
          url: `${process.env.UX_CLIENT_MAILER_URL}/verify-email/${emailVerificationToken}`,
        },
      });
    }

    await user.save();
  } catch (error) {
    console.warn({ error });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      usage,
      isAdmin,
      emailIsVerified = false,
    } = req.body;

    const users = await sequelize.models.User.findAll({ where: { email } });
    if (users?.length) {
      return res.send_badRequest("User was not created!", {
        email: "Email already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await sequelize.models.User.create({
      firstName,
      lastName,
      email,
      usage,
      password: hash,
      emailIsVerified: isAdmin,
    });

    verifyEmail(user, isAdmin, password);

    return res.send_ok(
      "Thanks for signing up for access! Please confirm your email address via the link we just sent you.",
      { user }
    );
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};
