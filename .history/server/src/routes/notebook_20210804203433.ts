import {
  create,
  deleteNotebook,
  findAll,
  findById,
  update,
} from "../controllers/notebook";

import { accessControlMiddleware } from "../services/accesscontrol";
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

router.get(
  "/",
  checkAuth,
  // accessControlMiddleware.check({
  //   resource: "notebooks",
  //   action: "read",
  //   operands: [
  //     { source: "user", key: "id" }, // means req.user.id
  //     null,
  //   ],
  // }),
  findAll
);

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

router.put(
  "/:userId",
  checkAuth,
  // accessControlMiddleware.check({
  //   resource: "notebooks",
  //   action: "update",
  //   operands: [
  //     { source: "user", key: "id" }, // means req.user.id
  //     null,
  //   ],
  // }),
  update
);

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
