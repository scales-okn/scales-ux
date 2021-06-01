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
import checkAuth from "../middlewares/checkAuth";
import { accessControlMiddleware } from "../services/accesscontrol";

const router = express.Router();

// Create a new User
router.post("/create", validateResource(createUserValidationSchema), create);

// User login
router.post("/login", validateResource(loginUserValidationSchema), login);

// Retrieve all Users
router.get(
  "/",
  checkAuth,
  accessControlMiddleware.check({
    resource: "users",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findAllUsers
);

// Retrieve User by id
router.get(
  "/:userId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "users",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findById
);

// Update a User with id
router.put(
  "/:userId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "users",
    action: "update",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  update
);

// Delete a User
router.delete(
  "/:userId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "users",
    action: "delete",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  deleteUser
);

export default router;
