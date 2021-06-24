import express from "express";
import {
  create,
  findAll,
  findById,
  update,
  deleteRing,
} from "../controllers/ring";
import validateResource from "../middlewares/validateResources";
import { createRingValidationSchema } from "../validation/ring";
import checkAuth from "../middlewares/checkAuth";
import { accessControlMiddleware } from "../services/accesscontrol";

const router = express.Router();

// Create a new Ring
router.post(
  "/create",
  validateResource(createRingValidationSchema),
  create
);

// Retrieve all Rings
router.get(
  "/",
  checkAuth,
  accessControlMiddleware.check({
    resource: "rings",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findAll
);

// Retrieve Ring by Id
router.get(
  "/:ringId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "rings",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findById
);

// Update a Ring
router.put(
  "/:userId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "rings",
    action: "update",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  update
);

// Delete a Ring
router.delete(
  "/:ringId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "rings",
    action: "delete",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  deleteRing
);

export default router;
