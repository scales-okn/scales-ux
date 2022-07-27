import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { sequelize } from "../database";
import mailer from "../services/mail";
import accessControl, {
  permisionsFieldsFilter,
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

    return res.send_ok(
      "Thanks for signing up for beta access! Please confirm your email address via the link we just sent you.",
      { user }
    );
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
      return res.send_badRequest("Something went wrong. Please try again."); // We will send bad request in this case to not have a user checking breach.
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
        { user: { id, email, role, firstName, lastName, blocked, approved } },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );

      return res.send_ok("Login Succesfull!", {
        token,
      });
    }
    return res.send_unauthorized("Login Failed!", {
      password: "Credentials are not correct!",
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
    const { userId } = req.params;

    const user = await sequelize.models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.send_notFound("User not found!");
    }

    // @ts-ignore
    const permission = await accessControl.can(req.user.role, "users:read", {
      user: req.user,
      resource: user,
    });
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    return res.send_ok("", {
      user: permisionsFieldsFilter(user.dataValues, permission),
    });
  } catch (error) {
    console.log(error);
    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update User
export const update = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await sequelize.models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.send_notFound("User not found!");
    }

    //@ts-ignore
    const permission = await accessControl.can(req.user.role, "users:read", {
      user: req.user,
      resource: user,
    });
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const payload = permisionsFieldsFilter(req.body, permission);
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(payload.password, salt);
      payload.password = hash;
    }

    // No changes made
    if (Object.keys(payload).length === 0) {
      return res.send_notModified("User has not been updated!");
    }

    // Inject req for saveLog
    sequelize.models.User.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.User.update(payload, {
      where: { id: userId },
      individualHooks: true,
      returning: true,
    });
    if (!result.length) {
      return res.send_notModified("User has not been updated!");
    }

    const updatedUser = result[1][0].dataValues;
    return res.send_ok("User has been updated!", {
      user: permisionsFieldsFilter(updatedUser, permission),
    });
  } catch (error) {
    console.log(error);
    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const permission = await accessControl.can(req.user.role, "users:delete");
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }
    const { userId } = req.params;
    const result = await sequelize.models.User.destroy({
      where: { id: userId },
    });
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
        mailer.sendMail(
          {
            from: `Satyrn <${process.env.SENDGRID_FROM_SENDER}>`,
            to: `${firstName} ${lastName} <${email}>`,
            subject: "Satyrn Beta Access",
            html: `
                Hello ${firstName}, <br /><br />
                Thanks for registering for access to Satyrn. 
                During our closed beta, we’re letting in a limited number of users, but will be expanding access over the coming months.<br /> 
                Now that your email address has been verified, you have been added to our approval queue.<br /> Once your account is approved, 
                you will receive an email to let you know you can log in to Satyrn. <br /><br />
                Thanks! <br />
                <br />
                The Satyrn Team<br />
                C3 Lab @ Northwestern University<br />
                <a href="https://c3lab.northwestern.edu">c3lab.northwestern.edu</a>`,
          },
          //@ts-ignore
          (error, info) => console.log(error, info)
        );
        return res.send_ok(
          "Thanks for registering your interest in trying out Satyrn with the SCALES dataset! We’ll let you know when you’ve been granted access."
        );
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
      const passwordResetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXP,
      });
      user.passwordResetToken = passwordResetToken;
      await user.save();
      mailer.sendMail(
        {
          from: `Satyrn <${process.env.SENDGRID_FROM_SENDER}>`,
          to: `${firstName} ${lastName} <${email}>`,
          subject: "Satyrn: Password reset request",
          html: `Hello ${firstName}, <br> 
          You are receiving this email because of a password reset request received at <a href="${process.env.UX_CLIENT_URL}">Satyrn</a>. <br />
          If you did not request a password reset, then please ignore this email and contact us at {EMAIL ADDRESS} to let us know. <br />
          Otherwise, <a href="${process.env.UX_CLIENT_URL}/reset-password/${passwordResetToken}">click here to reset your password.</a> <br /><br />
          Thanks! <br />
          <br />
          The Satyrn Team<br />
          C3 Lab @ Northwestern University<br />
          <a href="https://c3lab.northwestern.edu">c3lab.northwestern.edu</a>`,
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
      const { id: userId } = user.dataValues;

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await sequelize.models.User.update(
        {
          password: hash,
        },
        { where: { id: userId } }
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

export const usersList = async (req: Request, res: Response) => {
  try {
    const usersList = await sequelize.models.User.findAll({
      attributes: ["id", "firstName", "lastName", "role", "email"],
    });
    return res.send_ok("", { usersList });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to get users!");
  }
}