import express from "express";
import { searchGraph } from "../controllers/graph";

import checkAuth from "../middlewares/checkAuth";

const router = express.Router();

// Retrieve all Alerts
router.post("/", checkAuth, searchGraph);

export default router;
