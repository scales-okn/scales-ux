import express from "express";
import { update, findAll } from "../controllers/alerts";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Alerts
router.get("/", checkAuth, findAll);

// Approve a Alert
router.put("/:alertId", checkAuth, update);

export default router;
