import {
  create,
  deletePanel,
  findAll,
  findById,
  update,
  history,
} from "../controllers/panels";

import checkAuth from "../middlewares/checkAuth";
// import { createPanelValidationSchema } from "../validation/notebooks";
import express from "express";
import validateResource from "../middlewares/validateResources";

const router = express.Router();

router.post(
  "/",
  checkAuth,
  // validateResource(createPanelValidationSchema),
  create
);

router.get("/", checkAuth, findAll);

router.get("/:panelId", checkAuth, findById);

router.get("/:panelId/history", checkAuth, history);

router.put("/:panelId", checkAuth, update);

router.delete("/:panelId", checkAuth, deletePanel);

export default router;
