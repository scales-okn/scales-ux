import express from "express";
import {
  create,
  findAll,
  findById,
  update,
  deleteRing,
} from "../controllers/rings";
import validateResource from "../middlewares/validateResources";
import { createRingValidationSchema } from "../validation/rings";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Create a new Ring
router.post("/create", validateResource(createRingValidationSchema), create);

// Retrieve all Rings
router.get("/", checkAuth, findAll);

// Retrieve Ring by Id
router.get("/:ringId", checkAuth, findById);

// Update a Ring
router.put("/:userId", checkAuth, update);

// Delete a Ring
router.delete("/:ringId", checkAuth, deleteRing);

export default router;
