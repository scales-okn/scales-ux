import express from "express";
import { create, deleteNotebook, shareLink, findAll, findById, update, history, panels } from "../controllers/notebooks";

import checkAuth from "../middlewares/checkAuth";
import { createNotebookValidationSchema } from "../validation/notebooks";

import validateResource from "../middlewares/validateResources";
const router = express.Router();

router.post("/", checkAuth, validateResource(createNotebookValidationSchema), create);

router.get("/", checkAuth, findAll);

router.get("/:notebookId", checkAuth, findById);

router.get("/:notebookId/panels", checkAuth, panels);

router.get("/:notebookId/history", checkAuth, history);

router.put("/:notebookId", checkAuth, update);

router.delete("/:notebookId", checkAuth, deleteNotebook);

router.post("/shareLink", checkAuth, shareLink);

export default router;
