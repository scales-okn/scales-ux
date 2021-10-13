import express from "express";
import {
  create,
  findAllUsers,
  login,
  findById,
  update,
  deleteUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/users";
import validateResource from "../middlewares/validateResources";
import {
  createUserValidationSchema,
  loginUserValidationSchema,
} from "../validation/users";
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
    checkOwnerShip: true,
    operands: [
      { source: "user", key: "id" },
      { source: "params", key: "userId" },
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
    checkOwnerShip: true,
    operands: [
      { source: "user", key: "id" },
      { source: "params", key: "userId" },
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
  }),
  deleteUser
);

// Email Verify
router.post("/verify-email", verifyEmail);

// Password
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);

export default router;
