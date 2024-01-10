import express from "express";
import { create, update, findAll } from "../controllers/connections";
import validateResource from "../middlewares/validateResources";
import { createConnectionSchema } from "../validation/connections";
import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Create a new Connection
router.post("/create", validateResource(createConnectionSchema), create);

// Retrieve all Connections
router.get("/", checkAuth, findAll);

// Approve a Connection
router.put("/:connectionId", checkAuth, update);

export default router;
