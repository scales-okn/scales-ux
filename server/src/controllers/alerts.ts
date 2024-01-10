import { Request, Response } from "express";
import { sequelize } from "../database";
import { findAllAndPaginate } from "./util/findAllAndPaginate";
import { Op } from "sequelize";

// PUT update (mostly for marking viewed)
export const update = async (req: Request, res: Response) => {
  // try {
  //   const { senderId, receiverId, approved } = req.params;
  //   const connection = await sequelize.models.Connection.findOne({
  //     where: { sender: senderId, receiver: receiverId },
  //   });
  //   if (!connection) {
  //     return res.status(404).send("No pending connection found!");
  //   }
  //   await connection.update({ approved, pending: false });
  //   // Send mailers here
  //   return res.status(200).send("Connection updated successfully");
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).send("Internal server error");
  // }
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
      ],
    });

    return res.send_ok("", result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
