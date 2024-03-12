import express from "express";
import { create, update, findAll, remove, findAllApprovedConnectionUsers } from "../controllers/connections";
import validateResource from "../middlewares/validateResources";
import { createConnectionSchema } from "../validation/connections";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Create a new Connection
router.post("/create", validateResource(createConnectionSchema), create);

// Retrieve all Connections
router.get("/", checkAuth, findAll);

// Retrieve all Connections
router.get("/findAllApprovedConnectionUsers", checkAuth, findAllApprovedConnectionUsers);

// Approve a Connection
router.put("/:connectionId", checkAuth, update);

// Remove a Connection
router.delete("/:connectionId", checkAuth, remove);

export default router;
