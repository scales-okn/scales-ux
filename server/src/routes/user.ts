import passport from "passport";
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
} from "../controllers/user";
import validateResource from "../middlewares/validateResources";
import {
  createUserValidationSchema,
  loginUserValidationSchema,
} from "../validation/user";
import checkAuth from "../middlewares/checkAuth";
const router = express.Router();

// Create a new User
router.post("/create", validateResource(createUserValidationSchema), create);

// User login
router.post("/login", validateResource(loginUserValidationSchema), login);

// Retrieve all User
router.get("/", checkAuth, findAllUsers);

// Retrieve User by id
router.get("/:userId", checkAuth, findById);

// Update a User with id
router.put("/:userId", checkAuth, update);

// Delete a User
router.delete("/:userId", checkAuth, deleteUser);

// Email Verify
router.post("/verify-email", verifyEmail);

// Password
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);

export default router;
