import express from "express";
import { update, findAll, deleteAlert } from "../controllers/alerts";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Alerts
router.get("/", checkAuth, findAll);

// Approve a Alert
router.put("/:alertId", checkAuth, update);

// Approve a Alert
router.delete("/:alertId", checkAuth, deleteAlert);

export default router;
