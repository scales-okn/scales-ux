import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import database from "../database";
import mailTransport from "../services/mail";
import { use } from "passport";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/user.ts

// Create User
export const create = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, usage } = req.body;

  const users = await database.models.User.findAll({ where: { email } });
  if (users?.length) {
    return res.send_badRequest("User was not created!", {
      email: "Email already exists!",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await database.models.User.create({
      firstName,
      lastName,
      email,
      usage,
      password: hash,
      role: "admin",
    });

    return res.send_ok("User created succesfully!", { user });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await database.models.User.findOne({
    where: {
      email,
    },
  });

  // Check if user exists
  if (!user) {
    console.log("User not found!", { email, password });
    return res.send_notFound("Something went wrong. Please try again.");
  }

  try {
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

// Fetch all Users
export const findAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await database.models.User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { users });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Fetch User by userId
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const user = await database.models.User.findOne({ where: { id } });
    if (!user) {
      return res.send_notFound("User not found!");
    }

    return res.send_ok("", { user });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a User
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const payload = { ...req.body };
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(payload.password, salt);
      payload.password = hash;
    }
    const result = await database.models.User.update(payload, {
      where: { id },
    });

    if (!result.length) {
      return res.send_notModified("User has not been updated!");
    }
    const user = await database.models.User.findOne({ where: { id } });

    return res.send_ok("User has been updated!", { user });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a User
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const result = await database.models.User.destroy({ where: { id } });
    if (result) {
      return res.send_ok("User has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete user!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete user!");
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const user = await database.models.User.findOne({
      where: { emailVerificationCode: req.body.code, emailIsVerified: false },
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
            html: "<h1>Hello world!</h1>",
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
