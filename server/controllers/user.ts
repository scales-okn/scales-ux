import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import User from "../models/user";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/user.ts

// Create User
const create = async (req: Request, res: Response) => {
  const {
    email,
    password
  } = req.body;

  const user = await User.findAll({ where: { email } });
  if (user?.length) {
    return res.send_badRequest("User was not created!", { email: "Email already exists!" })
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await User.create({
      email,
      password: hash
    });

    return res.send_ok("User created succesfully!", { user });
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("An error occured, please try again!")
  }
};

// Login User
const login = async (req: Request, res: Response) => {
  const {
    email,
    password
  } = req.body;

  const user = await User.findAll({
    where: {
      email
    }
  });

  // Check if user exists
  if (!user.length) {
    return res.send_notFound("User not found!");
  }

  try {
    const userDataValues = user[0]?.dataValues;
    const { id, username } = userDataValues;
    const passwordsMatch = await bcrypt.compare(password, userDataValues.password);
    if (passwordsMatch) {
      const token = jwt.sign(
        { id, username },
        // @ts-ignore
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXP }
      );


      return res.send_ok("Login Succesfull!", {
        token: "Bearer " + token,
      });
    } else {
      return res.send_badRequest("Login Failed!", { password: "Password is not correct!" })
    }
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("An error occured, please try again!")
  }
};

// Fetch all Users
const findAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll();

    return res.send_ok("", { users });
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("An error occured, please try again!")
  }
};

// Fetch User by userId
const findById = async (req: Request, res: Response) => {
  console.log(req);
  try {
    const id = req.params.userId;
    const user = await User.findAll({ where: { id } });
    if (!user.length) {
      return res.send_notFound("User not found!");
    }

    return res.send_ok("", { user });
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("An error occured, please try again!")
  }
}

// Update a User
const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    let payload = req.body;
    if (payload.password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(payload.password, salt);
      payload.password = hash;
    }
    const result = await User.update(payload, { where: { id } });
    if (!result.length) {
      return res.send_notModified("User has not been updated!");
    }
    const user = await User.findAll({ where: { id } });

    return res.send_ok("User has been updated!", {user});
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("An error occured, please try again!")
  }
};

// Delete a User
const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    await User.destroy({ where: { id } });

    return res.send_ok("User has been deleted successfully!");
  } catch (err) {
    console.log(err);

    return res.send_internalServerError("Failed to delete user!")
  }
};

export {
  create,
  login,
  findAllUsers,
  findById,
  update,
  deleteUser
};
