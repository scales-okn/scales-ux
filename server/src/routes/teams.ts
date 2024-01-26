import express from "express";
import { create, update, findAll, deleteTeam } from "../controllers/teams";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Teams
router.get("/", checkAuth, findAll);

// Create a Team
router.post("/", checkAuth, create);

// Update a Team
router.put("/:teamId", checkAuth, update);

// Delete a Team
router.delete("/:teamId", checkAuth, deleteTeam);

// Add User to Team
router.put("/:teamId/updateTeamUsers", checkAuth, update);

export default router;
