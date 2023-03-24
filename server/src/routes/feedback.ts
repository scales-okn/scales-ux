import express from "express";
import { create, deleteFeedback, findAll } from "../controllers/feedback";

import checkAuth from "../middlewares/checkAuth";
import { createFeedbackValidationSchema } from "../validation/feedback";

import validateResource from "../middlewares/validateResources";
const router = express.Router();

router.post(
  "/",
  checkAuth,
  validateResource(createFeedbackValidationSchema),
  create
);

router.get("/", checkAuth, findAll);

router.delete("/:feedbackId", checkAuth, deleteFeedback);

export default router;
