import express from "express";
import { update, findAll, deleteAlert, deleteAll } from "../controllers/alerts";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Alerts
router.get("/", checkAuth, findAll);

// Approve an Alert
router.put("/:alertId", checkAuth, update);

// Delete an Alert
router.delete("/:alertId", checkAuth, deleteAlert);

// Delete all alerts
router.post("/deleteAll", checkAuth, deleteAll);

export default router;
