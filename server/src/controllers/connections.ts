import { Request, Response } from "express";
import { sequelize } from "../database";
import { findAllAndPaginate } from "./util/findAllAndPaginate";
import { Op } from "sequelize";

// POST Create Connection Request
export const create = async (req: Request, res: Response) => {
  try {
    const { email, note, senderId } = req.body;

    const receiver = await sequelize.models.User.findOne({ where: { email } });

    if (!receiver) {
      return res.status(404).send("No user found with that email!");
    }

    const newConnection = await sequelize.models.Connection.create({
      sender: senderId,
      receiver: receiver.id,
      note,
    });

    await sequelize.models.Alert.create({
      userId: receiver.id,
      initiatorUserId: senderId,
      type: "connect",
      connectionId: newConnection.id,
    });

    // include sender and receiver user
    await newConnection.reload({
      attributes: ["id", "sender", "receiver", "note", "approved", "pending"],
      include: [
        {
          model: sequelize.models.User,
          as: "senderUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.User,
          as: "receiverUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return res.send_ok("", { newConnection });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// PUT update (mostly for approval)
export const update = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, approved } = req.params;

    const connection = await sequelize.models.Connection.findOne({
      where: { sender: senderId, receiver: receiverId },
    });

    if (!connection) {
      return res.status(404).send("No pending connection found!");
    }

    await connection.update({ approved, pending: false });

    // Send mailers here

    return res.status(200).send("Connection updated successfully");
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

    // Find all where the sender is the user or the receiver is the user and approved is true
    const where = {
      [Op.or]: [
        {
          sender: sessionUser.id,
        },
        {
          [Op.and]: [
            {
              receiver: sessionUser.id,
            },
            {
              approved: true,
            },
          ],
        },
      ],
    };

    const result = await findAllAndPaginate({
      model: sequelize.models.Connection,
      query: req.query,
      dataName: "connections",
      where,
      attributes: ["id", "sender", "receiver", "approved", "note", "pending"],
      include: [
        {
          model: sequelize.models.User,
          as: "senderUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.User,
          as: "receiverUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    return res.send_ok("", result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
