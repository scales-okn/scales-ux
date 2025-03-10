import { Request, Response } from "express";
import { sequelize } from "../database";
import { findAllAndPaginate } from "./util/findAllAndPaginate";
import { sendEmail } from "../services/sesMailer";
import { Op } from "sequelize";

// POST Create Connection Request
export const create = async (req: Request, res: Response) => {
  try {
    const { email, note, senderId } = req.body;

    const receiver = await sequelize.models.User.findOne({ where: { email } });
    const sender = await sequelize.models.User.findOne({ where: { id: senderId } });

    if (!receiver || !sender) {
      return res.status(404).send({ code: 404, message: "No user found with that email!" });
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

    if (receiver.notifyOnConnectionRequest) {
      sendEmail({
        emailSubject: "You have a new connection request!",
        recipientEmail: receiver.email,
        templateName: "notifyOnConnectionRequest",
        recipientName: `${receiver.firstName} ${receiver.lastName}`,
        templateArgs: {
          saturnUrl: process.env.UX_CLIENT_MAILER_URL,
          sesSender: process.env.SES_SENDER,
          senderName: `${sender.firstName} ${sender.lastName}`,
          url: `${process.env.UX_CLIENT_MAILER_URL}/connections?connectionId=${newConnection.id}`,
        },
      });
    }

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

    const sender = await sequelize.models.User.findOne({
      where: { id: connection.sender },
    });
    const receiver = await sequelize.models.User.findOne({
      where: { id: connection.receiver },
    });

    if (!sender || !receiver) {
      return res.status(404).send("No user found!");
    }

    if (sender.notifyOnConnectionResponse) {
      sendEmail({
        emailSubject: `${receiver.firstName} ${receiver.lastName} has responded to your connection request!`,
        recipientEmail: sender.email,
        templateName: "notifyOnConnectionResponse",
        recipientName: `${sender.firstName} ${sender.lastName}`,
        templateArgs: {
          saturnUrl: process.env.UX_CLIENT_MAILER_URL,
          sesSender: process.env.SES_SENDER,
          approvedText: approved ? "approved" : "denied",
          receiverName: `${receiver.firstName} ${receiver.lastName}`,
          url: `${process.env.UX_CLIENT_MAILER_URL}/connections`,
        },
      });
      await sequelize.models.Alert.create({
        userId: sender.id,
        initiatorUserId: receiver.id,
        type: "connectResponse",
        connectionId: connection.id,
      });
    }

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
                pending: false,
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

    const connections = await sequelize.models.User.findAll({
      where: {
        id: {
          [Op.in]: otherUserIds,
        },
      },
      attributes: ["id", "firstName", "lastName", "email"],
    });
    return res.send_ok("", { connections });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.params;
    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const connection = await sequelize.models.Connection.findOne({
      where: { id: connectionId },
    });

    if (!connection) {
      return res.status(404).send("No connection found!");
    }

    const sender = await sequelize.models.User.findOne({
      where: { id: connection.sender },
    });
    const receiver = await sequelize.models.User.findOne({
      where: { id: connection.receiver },
    });

    if (!sender || !receiver) {
      return res.status(404).send("No user found!");
    }

    if (sender.id !== sessionUser.id && receiver.id !== sessionUser.id) {
      return res.status(403).send("You are not authorized to delete this connection!");
    }

    await connection.destroy();

    return res.send_ok("Connection has been deleted!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
