import passport from "passport";
import express from "express";
import {
  create,
  findAllUsers,
  login,
  findById,
  update,
  deleteUser,
} from "../controllers/user";
import validateResource from "../middlewares/validateResources";
import {
  createUserValidationSchema,
  loginUserValidationSchema,
} from "../validation/user";

const userRoutes = express.Router();

// Create a new User
userRoutes.post(
  "/create",
  validateResource(createUserValidationSchema),
  create
);

// User login
userRoutes.post(
  "/login",
  validateResource(loginUserValidationSchema),
  login
);

// Retrieve all Users
userRoutes.get(
  "/",
  passport.authenticate("jwt", {
    session: false,
  }),
  findAllUsers
);

// Retrieve User by id
userRoutes.get(
  "/:userId",
  passport.authenticate("jwt", {
    session: false,
  }),
  findById
);

// Update a User with id
userRoutes.put(
  "/:userId",
  passport.authenticate("jwt", {
    session: false,
  }),
  update
);

// Delete a User
userRoutes.delete(
  "/:userId",
  passport.authenticate("jwt", {
    session: false,
  }),
  deleteUser
);

export default userRoutes;


// TODO: Authorization, Access Levels
