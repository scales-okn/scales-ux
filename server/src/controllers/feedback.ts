import { Request, Response } from "express";
import { sequelize } from "../database";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/feedback.ts

// Create Feedback
export const create = async (req: Request, res: Response) => {
  try {
    const { body } = req.body;

    const feedback = await sequelize.models.Feedback.create({
      body,
    });

    return res.send_ok("Feedback created successfully!", { feedback });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find all Feedback
export const findAll = async (req: Request, res: Response) => {
  try {
    const feedback = await sequelize.models.Feedback.findAll({
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { feedback });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Delete a Feedback
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const { feedbackId } = req.params;

    const result = await sequelize.models.Feedback.destroy({
      where: { id: feedbackId },
    });
    if (result) {
      return res.send_ok("Feedback has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete feedback!");
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("Failed to delete feedback!");
  }
};
