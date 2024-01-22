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

// PUT update (for approval)
export const update = async (req: Request, res: Response) => {
  try {
    const { approved } = req.body;
    const { connectionId } = req.params;

    const connection = await sequelize.models.Connection.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).send("No pending connection found!");
    }

    await connection.update({ approved, pending: false });

    // Send mailers here

    return res.send_ok("User has been updated!", {
      connection,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    const { pending, approved } = req.query;

    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const filterConditions = {
      ...(pending === "true" && { pending: true }),
      ...(pending === "false" && { pending: false }),
      ...(approved === "true" && { approved: true }),
      ...(approved === "false" && { approved: false, pending: false }),
    };

    const where = {
      [Op.or]: [
        {
          sender: sessionUser.id,
          ...filterConditions,
        },
        ...(approved !== "false"
          ? [
              {
                receiver: sessionUser.id,
                ...filterConditions,
                approved: true,
              },
            ]
          : []),
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

export const findAllApprovedConnectionUsers = async (req: Request, res: Response) => {
  try {
    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const connectionIds = await sequelize.models.Connection.findAll({
      attributes: ["sender", "receiver"],
      where: {
        [Op.or]: [
          { sender: sessionUser.id, approved: true },
          { receiver: sessionUser.id, approved: true },
        ],
      },
    });

    const userIds = Array.from(new Set([...connectionIds.map((conn) => conn.sender), ...connectionIds.map((conn) => conn.receiver)]));

    const otherUserIds = userIds.filter((userId) => userId !== sessionUser.id);

    const result = await sequelize.models.User.findAll({
      where: {
        id: {
          [Op.in]: otherUserIds,
        },
      },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    return res.send_ok("", result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
