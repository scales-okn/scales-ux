import { DataTypes } from "sequelize";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/sesMailer";
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

      // const recipientName = `${firstName} ${lastName}`;
      // TODO: replace mock recipient email
      // sendEmail({
      //   emailSubject: `Welcome to SCALES, ${recipientName}!`,
      //   recipientEmail: "benkiggen@gmail.com",
      //   templateName: "confirmAccount",
      //   recipientName,
      //   templateArgs: {
      //     url: `${process.env.UX_CLIENT_MAILER_URL}/verify-email/${emailVerificationToken}`,
      //   },
      // });

      mailer.sendMail(
        {
          from: `Satyrn <${process.env.SENDGRID_FROM_SENDER}>`,
          to: `${firstName} ${lastName} <${email}>`,
          subject: "Satyrn - Please verify your email address",
          html: `Hello ${firstName}, <br /><br />
          Thank you for signing up for access to Satyrn.<br />
          Please <a href="${process.env.UX_CLIENT_MAILER_URL}/verify-email/${emailVerificationToken}">click here to verify this email address</a>. <br /><br />
          <br />
          SCALES OKN<br />
          www.scales-okn.org`,
        },
        (error, info) => {
          // TODO: revisit this. Commented out bc ts breaking
          // const errorsArray = error?.response?.body?.errors;
          // if (errorsArray) {
          //   errorsArray.map((ea) => {
          //     console.log("*********************");
          //     console.log("message: ", ea.message);
          //     console.log("field: ", ea.field);
          //     console.log("help: ", ea.help);
          //     console.log("*********************");
          //   });
          // }
          console.warn("info: ", info, error);
        }
      );

      await user.save();
    } catch (error) {
      console.warn({ error });
    }
  });

  // // we're no longer doing manual approval
  // User.addHook("afterBulkUpdate", "sendUserApproveEmail", async (updated) => {
  //   try {
  //     const { fields, attributes, where } = updated;

  //     if (fields.includes("approved") && attributes?.approved === true) {
  //       const user = await User.findOne({ where });
  //       const { firstName, lastName, email } = user.dataValues;
  //       mailer.sendMail(
  //         {
  //           from: `Satyrn <${process.env.SENDGRID_FROM_SENDER}>`,
  //           to: `${firstName} ${lastName} <${email}>`,
  //           subject: "Welcome to the Satyrn Beta!",
  //           html: `Hello ${firstName}, <br> <br>
  //           Your account has been approved and you can now access Satyrn! You can sign in <a href="${process.env.UX_CLIENT_MAILER_URL}/sign-in">here</a>. <br />
  //           Please feel free to reach out to us at <EMAIL ADDRESS> with any questions or bug reports as you begin using the system. <br />
  //           If you’re looking for a good place to get started, see <a href=”<LINK TO FUTURE POST”>this post</a> for more details about using the system.<br /> <br/>
  //           Thanks! <br/>
  //           <br />
  //           SCALES OKN<br />
  //           www.scales-okn.org
  //           `,
  //         },
  //         (error, info) => console.log(error, info)
  //       );
  //     }
  //   } catch (error) {
  //     console.log({ error });
  //   }
  // });

  return User;
};
