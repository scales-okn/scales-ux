import express from "express";
import { create, update, findAll } from "../controllers/teams";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Teams
router.get("/", checkAuth, findAll);

// Create a Team
router.post("/", checkAuth, create);

// Update a Team
router.put("/:teamId", checkAuth, update);

// Add User to Team
router.put("/:teamId/updateTeamUsers", checkAuth, update);

export default router;
