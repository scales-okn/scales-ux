import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sequelize } from "../database";
import mailTransport from "../services/mail";
import accessControl, {
  accessControlFieldsFilter,
} from "../services/accesscontrol";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/user.ts

// Create User
export const create = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, usage } = req.body;

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
    });

    return res.send_ok("User created succesfully!", { user });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// User Login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await sequelize.models.User.findOne({
      where: {
        email,
      },
    });

    // Check if user exists
    if (!user) {
      console.log("User not found!", { email, password });
      return res.send_notFound("Something went wrong. Please try again.");
    }
    const {
      id,
      role,
      firstName,
      lastName,
      blocked,
      approved,
      emailIsVerified,
    } = user.dataValues;

    if (blocked) {
      return res.send_forbidden("Access restricted!");
    }

    if (!emailIsVerified) {
      return res.send_forbidden(
        "Access restricted! Please verify your email before signing in."
      );
    }

    if (!approved) {
      return res.send_forbidden(
        "Access restricted! Please wait for approval email!"
      );
    }

    const passwordsMatch = await bcrypt.compare(
      password,
      user.dataValues.password
    );
    if (passwordsMatch) {
      const token = jwt.sign(
        { id, email, role, firstName, lastName, blocked, approved },
        // @ts-ignore
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );

      return res.send_ok("Login Succesfull!", {
        token,
      });
    }
    return res.send_badRequest("Login Failed!", {
      password: "Password is not correct!",
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find all Users
export const findAllUsers = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const permission = await accessControl.can(req.user.role, "users:read");
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const users = await sequelize.models.User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { users });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find User by userId
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await sequelize.models.User.findOne({ where: { id } });
    // @ts-ignore
    const permission = await accessControl.can(req.user.role, "users:read", {
      user: req.user,
      resource: user,
    });
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    if (!user) {
      return res.send_notFound("User not found!");
    }

    return res.send_ok("", {
      user: accessControlFieldsFilter(user.dataValues, permission.fields),
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update User
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await sequelize.models.User.findOne({ where: { id } });

    if (!user) {
      return res.send_notFound("User not found!");
    }

    // @ts-ignore
    const permission = await accessControl.can(req.user.role, "users:update", {
      user: req.user,
      resource: user,
    });

    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const payload = accessControlFieldsFilter(req.body, permission.fields);

    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(payload.password, salt);
      payload.password = hash;
    }
    // Inject req for saveLog
    sequelize.models.User.beforeUpdate((model: any) => {
      model.req = req;
    });

    if (Object.keys(payload).length === 0) {
      return res.send_notModified("User has not been updated!");
    }

    const result = await sequelize.models.User.update(payload, {
      where: { id },
      individualHooks: true,
      returning: true,
    });

    if (!result.length) {
      return res.send_notModified("User has not been updated!");
    }

    const updatedUser = result[1][0].dataValues;

    return res.send_ok("User has been updated!", {
      user: accessControlFieldsFilter(updatedUser, permission.fields),
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const result = await sequelize.models.User.destroy({ where: { id } });
    if (result) {
      return res.send_ok("User has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete user!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete user!");
  }
};

// Email Verify
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const decodedToken = jwt.verify(req.body.token, process.env.JWT_SECRET);
    console.log("verifyEmail", decodedToken);
    const user = await sequelize.models.User.findOne({
      where: { emailVerificationToken: req.body.token, emailIsVerified: false },
    });
    if (user) {
      const updated = await user.update({
        emailIsVerified: true,
      });
      const { firstName, lastName, email } = user;
      if (updated) {
        mailTransport.sendMail(
          {
            from: process.env.SENDGRID_FROM_SENDER,
            to: `${firstName} ${lastName} <${email}>`,
            subject: "Welcome to Satyrn!",
            html: `
                Hello, <br />
                Thanks for registering with us. <br />
                Your account it has to be approved. You will receive an email when is approved so you can start using it.
            `,
          },
          //@ts-ignore
          (error, info) => console.log(error, info)
        );
        return res.send_ok("Email verified succesfully!");
      }
    } else {
      return res.send_badRequest(
        "Invalid email verification code or is already verified."
      );
    }
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to verify your email!");
  }
};

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const user = await sequelize.models.User.findOne({
      where: { email: req.body.email },
    });

    if (user) {
      const { firstName, lastName, email } = user;
      const passwordResetToken = jwt.sign(
        { email },
        //@ts-ignore
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );
      user.passwordResetToken = passwordResetToken;
      await user.save();
      mailTransport.sendMail(
        {
          from: process.env.SENDGRID_FROM_SENDER,
          to: `${firstName} ${lastName} <${email}>`,
          subject: "Forgot Password",
          html: `Hello, <br> 
          <a href="${process.env.CLIENT_URL}/reset-password/${passwordResetToken}">Click here to reset your password.</a>`,
        },
        //@ts-ignore
        (error, info) => console.log(error, info)
      );
      return res.send_ok("Reset password link sent to your email!");
    } else {
      return res.send_badRequest("Email not found!");
    }
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to reset your password!");
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    const user = await sequelize.models.User.findOne({
      where: { passwordResetToken: token },
    });

    if (user) {
      //@ts-ignore
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log("resetPassword", decodedToken);
      const { id } = user.dataValues;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await sequelize.models.User.update(
        {
          password: hash,
        },
        { where: { id } }
      );

      return res.send_ok(
        "Password succesfully reseted. You can now sign in using it."
      );
    } else {
      return res.send_internalServerError("Failed to reset your password!");
    }
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to reset your password!");
  }
};
