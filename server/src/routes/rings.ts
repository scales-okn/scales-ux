import express from "express";
import {
  create,
  findAll,
  // findById,
  // update,
  getRingVersions,
  deleteRing,
  // version,
} from "../controllers/rings";
import validateResource from "../middlewares/validateResources";
import { createRingValidationSchema } from "../validation/rings";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Create a new Ring
router.post("/", checkAuth, validateResource(createRingValidationSchema), create);

// Retrieve all Rings
router.get("/", checkAuth, findAll);

// Retrieve ring versions by RID
router.get("/:rid", checkAuth, getRingVersions);

// Retrieve Ring by Id
// router.get("/:ringId", checkAuth, findById);

// Retrieve Ring Version
// router.get("/:ringId/:version", checkAuth, version);

// Update a Ring
// router.put("/:ringId", checkAuth, update);

// Delete a Ring and its versions
router.delete("/:rid", checkAuth, deleteRing);

export default router;
