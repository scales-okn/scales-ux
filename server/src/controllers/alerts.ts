import { Request, Response } from "express";
import { sequelize } from "../database";
import { findAllAndPaginate } from "./util/findAllAndPaginate";
import { Op } from "sequelize";

// PUT update (for marking viewed)
export const update = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { viewed } = req.body;

    const alert = await sequelize.models.Alert.findOne({
      where: { id: alertId },
      include: [
        {
          model: sequelize.models.Connection,
          as: "connection",
        },
      ],
    });

    if (!alert) {
      return res.status(404).send("No pending alert found!");
    }

    await alert.update({ viewed });

    // Send mailers here

    return res.send_ok("User has been updated!", {
      alert,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const result = await findAllAndPaginate({
      model: sequelize.models.Alert,
      dataName: "alerts",
      query: { pageSize: 10 },
      where: {
        userId: sessionUser.id,
      },
      attributes: ["id", "viewed", "createdAt", "type", "connectionId"],
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.User,
          as: "initiatorUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.Connection,
          as: "connection",
          attributes: ["id", "sender", "receiver", "note", "approved", "pending"],
        },
        {
          model: sequelize.models.Team,
          as: "team",
          attributes: ["id", "name", "description"],
        },
        {
          model: sequelize.models.Notebook,
          as: "notebook",
          attributes: ["id", "title", "description"],
        },
      ],
    });

    return res.send_ok("", result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const deleteAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const alert = await sequelize.models.Alert.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      return res.status(404).send("Alert not found!");
    }

    await alert.destroy();

    return res.send_ok("Alert deleted successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
