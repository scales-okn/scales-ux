import express from "express";
import {
  create,
  deleteNotebook,
  findAll,
  findById,
  update,
  history,
} from "../controllers/notebooks";

import checkAuth from "../middlewares/checkAuth";
import { createNotebookValidationSchema } from "../validation/notebooks";

import validateResource from "../middlewares/validateResources";
import { accessControlMiddleware } from "../services/accesscontrol";

const router = express.Router();

router.post(
  "/",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "create",
  }),
  validateResource(createNotebookValidationSchema),
  create
);

router.get(
  "/",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "read",
  }),
  checkAuth,
  findAll
);

router.get(
  "/:notebookId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "read",
  }),
  findById
);

router.get(
  "/:notebookId/history",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "read",
  }),
  history
);

router.put(
  "/:notebookId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "update",
  }),
  update
);

router.delete(
  "/:notebookId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "delete",
  }),
  deleteNotebook
);

export default router;
