import express from "express";
import { create, deleteHelpText, findAll } from "../controllers/helpTexts";

import checkAuth from "../middlewares/checkAuth";
import { createHelpTextValidationSchema } from "../validation/helpTexts";

import validateResource from "../middlewares/validateResources";
const router = express.Router();

router.post(
  "/",
  checkAuth,
  validateResource(createHelpTextValidationSchema),
  create
);

router.get("/", checkAuth, findAll);

router.delete("/:helpTextId", checkAuth, deleteHelpText);

export default router;
