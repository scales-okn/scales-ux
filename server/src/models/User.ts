import { DataTypes, Sequelize } from "sequelize";
import jwt from "jsonwebtoken";
import mailer from "../services/mail";

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
      mailer.sendMail(
        {
          from: process.env.SENDGRID_FROM_SENDER,
          to: `${firstName} ${lastName} <${email}>`,
          subject: "Satyrn - Please verify your email address",
          html: `Hello ${firstName}, <br />
          Thank you for signing up for access to <a href="${process.env.UX_CLIENT_URL}">Satyrn</a>.<br />
          Please <a href="${process.env.UX_CLIENT_URL}/verify-email/${emailVerificationToken}">click here to verify this email address</a>. <br /><br />
          - The Satyrn Team`,
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
        mailer.sendMail(
          {
            from: process.env.SENDGRID_FROM_SENDER,
            to: `${firstName} ${lastName} <${email}>`,
            subject: "Welcome to the Satyrn Beta!",
            html: `Hello ${firstName}, <br> 
            Your account has been approved and you can now access Satyrn! You can sign in <a href="${process.env.UX_CLIENT_URL}/sign-in">here</a>. <br />
            Please feel free to reach out to us at <EMAIL ADDRESS> with any questions or bug reports as you begin using the system. <br />
            If you’re looking for a good place to get started, see <a href=”<LINK TO FUTURE POST”>this post</a> for more details about using the system.<br /> <br/>
            Thanks! <br/>
            - The Satyrn Team
            `,
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
