import {
  create,
  deleteNotebook,
  findAll,
  findById,
  update,
  history,
} from "../controllers/notebook";

import checkAuth from "../middlewares/checkAuth";
import { createNotebookValidationSchema } from "../validation/notebook";
import express from "express";
import validateResource from "../middlewares/validateResources";

const router = express.Router();

router.post(
  "/create",
  validateResource(createNotebookValidationSchema),
  create
);

router.get("/", checkAuth, findAll);

router.get("/:notebookId", checkAuth, findById);

router.get("/:notebookId/history", checkAuth, history);

router.put("/:notebookId", checkAuth, update);

router.delete("/:notebookId", checkAuth, deleteNotebook);

export default router;
