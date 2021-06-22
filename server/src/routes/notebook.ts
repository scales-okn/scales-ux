import express from "express";
import {
  create,
  findAll,
  findById,
  update,
  deleteNotebook,
} from "../controllers/notebook";
import validateResource from "../middlewares/validateResources";
import { createNotebookValidationSchema } from "../validation/notebook";
import checkAuth from "../middlewares/checkAuth";
import { accessControlMiddleware } from "../services/accesscontrol";

const router = express.Router();

// Create a new Notebook
router.post(
  "/create",
  validateResource(createNotebookValidationSchema),
  create
);

// Retrieve all Notebooks
router.get(
  "/",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findAll
);

// Retrieve Notebook by Id
router.get(
  "/:notebookId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "read",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  findById
);

// Update a Notebook
router.put(
  "/:userId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "update",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  update
);

// Delete a Notebook
router.delete(
  "/:notebookId",
  checkAuth,
  accessControlMiddleware.check({
    resource: "notebooks",
    action: "delete",
    operands: [
      { source: "user", key: "id" }, // means req.user.id
      null,
    ],
  }),
  deleteNotebook
);

export default router;
