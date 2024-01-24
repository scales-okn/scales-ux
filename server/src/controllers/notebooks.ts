import { Request, Response } from "express";
import { sequelize } from "../database";
import accessControl from "../services/accesscontrol";
import { Op } from "sequelize";
import { permissionsFieldsFilter } from "../services/accesscontrol";
import { findAllAndPaginate } from "./util/findAllAndPaginate";
import { sendEmail } from "../services/sesMailer";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/notebook.ts

// Create Notebook
export const create = async (req: Request, res: Response) => {
  try {
    const {
      id = null, // ID of original notebook if this is a copy
      title,
      collaborators = [],
      sharedWith = [],
      contents,
      visibility,
      parent = null,
    } = req.body;
    //@ts-ignore
    const userId = req.user.id;

    const newNotebook = await sequelize.models.Notebook.create({
      title,
      userId,
      collaborators,
      sharedWith,
      contents,
      visibility,
      parent,
    });
    const newNotebookId = newNotebook.id;

    // Duplicate Panels
    if (id) {
      const originalNotebook = await sequelize.models.Notebook.findOne({
        where: { id },
      });
      const originalPanels = await sequelize.models.Panel.findAll({
        where: { notebookId: originalNotebook.id },
      });

      if (!originalNotebook || !originalPanels.length) return;

      originalPanels.map((panel) => {
        const { description, ringRid, ringVersion, filters, results, contents, analysis } = panel;

        sequelize.models.Panel.create({
          description,
          notebookId: newNotebookId,
          ringRid,
          ringVersion,
          filters,
          results,
          contents,
          analysis,
          userId: userId,
        });
      });
    }

    return res.send_ok("Notebook created successfully!", {
      notebook: newNotebook,
    });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find all Notebooks
export const findAll = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const { role, id: userId } = req.user;

    const sessionUserTeams = await sequelize.models.Team.findAll({
      attributes: ["id"],
      include: [
        {
          model: sequelize.models.User,
          as: "users",
          where: { id: userId },
          attributes: [],
        },
      ],
      raw: true,
    });

    const teamIds = sessionUserTeams.map((team) => team.id);

    const permission = await accessControl.can(role, "notebooks:read");
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const where = {
      ...(req.query.search ? { title: { [Op.iLike]: `%${req.query.search}%` } } : {}),
    };

    if (req.query.type === "public") {
      where[Op.and] = [{ visibility: "public" }, { userId: { [Op.ne]: userId } }];
    } else if (req.query.type === "shared") {
      where[Op.and] = [{ visibility: "public" }, { sharedWith: { [Op.contains]: [userId] } }];
    } else {
      where[Op.or] = [{ userId }, { collaborators: { [Op.contains]: [userId] } }, { teamId: { [Op.in]: teamIds } }];
    }

    const result = await findAllAndPaginate({
      model: sequelize.models.Notebook,
      query: req.query,
      dataName: "notebooks",
      where,
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.Team,
          as: "team",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    return res.send_ok("", result);
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find Notebook by notebookId
export const findById = async (req: Request, res: Response) => {
  try {
    const notebookId = req.params.notebookId;
    //@ts-ignore
    const { role, id: reqUserId } = req.user;

    let where = { id: notebookId };

    const notebook = await sequelize.models.Notebook.findOne({
      where,
      include: [
        {
          model: sequelize.models.Team,
          as: "team",
          attributes: ["id", "name", "description"],
          include: [
            {
              model: sequelize.models.User,
              as: "users",
              through: { attributes: ["role"] },
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
    });

    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const { visibility, collaborators, userId, sharedWith } = notebook;
    if (role !== "admin" && visibility !== "public" && !collaborators.includes(reqUserId) && !sharedWith.includes(reqUserId) && userId !== reqUserId) {
      return res.send_forbidden("Not allowed!");
    }

    const user = await sequelize.models.User.findOne({
      where: { id: notebook.userId },
    });

    return res.send_ok("", {
      notebook: { ...notebook.dataValues, user },
    });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Are we using this?
export const history = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role } = req.user;
    if (role !== "admin") {
      return res.send_forbidden("Not allowed!");
    }

    const notebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const versions = await sequelize.models.Notebook.getVersions({
      where: { id: notebookId },
    });

    return res.send_ok("", { versions });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Update a Notebook
export const update = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role, id: reqUserId } = req.user;

    let where = { id: notebookId };

    const notebook = await sequelize.models.Notebook.findOne({
      where,
    });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const permission = await accessControl.can(role, "notebooks:update", {
      user: req.user,
      resource: notebook,
    });
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const payload = permissionsFieldsFilter(req.body, permission);

    if (Object.keys(payload).length === 0) {
      return res.send_notModified("Notebook has not been updated!");
    }

    const { collaborators, userId } = notebook;
    // General Case
    if (role !== "admin" && !collaborators.includes(reqUserId) && userId !== reqUserId) {
      return res.send_forbidden("Not allowed!");
    }

    // Inject req for saveLog
    //@ts-ignore
    sequelize.models.Notebook.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.Notebook.update(payload, {
      where: { id: notebookId },
      individualHooks: true,
    });

    // add notifications for team users if teamId added to notebook
    if (req.body.teamId) {
      const team = await sequelize.models.Team.findOne({
        where: { id: req.body.teamId },
      });
      if (!team) {
        return res.send_notFound("Team not found!");
      }
      const teamUsers = await team.getUsers();
      const teamUsersIds = teamUsers.map((user) => user.id);
      teamUsersIds.map(async (userId) => {
        await sequelize.models.Alert.create({
          userId,
          initiatorUserId: reqUserId,
          type: "notebookAddedToTeam",
          teamId: team.id,
          notebookId: notebookId,
        });
      });
    }

    if (!result.length) {
      return res.send_notModified("Notebook has not been updated!");
    }
    const updatedNotebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
      include: [
        {
          model: sequelize.models.User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: sequelize.models.Team,
          as: "team",
          attributes: ["id", "name", "description"],
        },
      ],
    });

    return res.send_ok(`Notebook ${notebookId} has been updated!`, {
      ...updatedNotebook.dataValues,
    });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Delete a Notebook
export const deleteNotebook = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;

    const notebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });

    if (!notebook) {
      return res.send_notFound("Notebook not found");
    }

    await notebook.destroy();

    return res.send_ok("Notebook deleted successfully");
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("Failed to delete notebook!");
  }
};

export const panels = async (req: Request, res: Response) => {
  try {
    const { notebookId } = req.params;
    //@ts-ignore
    const { role } = req.user;
    const notebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
    });

    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const { visibility, collaborators, sharedWith, userId } = notebook;

    //@ts-ignore
    if (role !== "admin" && visibility !== "public" && !collaborators.includes(userId) && !sharedWith.includes(userId) && userId !== req.user.id) {
      return res.send_forbidden("Not allowed!");
    }

    const panels = await sequelize.models.Panel.findAll({
      where: { notebookId },
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { panels });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

export const shareLink = async (req: Request, res: Response) => {
  try {
    const { id, recipientName, recipientEmail, message, senderId } = req.body;

    const notebook = await sequelize.models.Notebook.findOne({ id });
    const sender = await sequelize.models.User.findOne({ id: senderId });

    if (!notebook) {
      return res.status(404).json({ error: "Notebook not found" });
    }
    if (!sender) {
      return res.status(404).json({ error: "Sender not found" });
    }

    const recipient = await sequelize.models.User.findOne({ where: { email: recipientEmail } });
    if (recipient) {
      await sequelize.models.Notebook.update({ sharedWith: sequelize.fn("array_append", sequelize.col("sharedWith"), recipient.id) }, { where: { id } });
    }

    sendEmail({
      emailSubject: "SCALES Notebook Link",
      recipientEmail,
      templateName: "shareLink",
      recipientName,
      templateArgs: {
        saturnUrl: process.env.UX_CLIENT_MAILER_URL,
        sesSender: process.env.SES_SENDER,
        url: `${process.env.UX_CLIENT_MAILER_URL}/notebooks/${id}`,
        message,
        secondaryUrl: `${process.env.UX_CLIENT_MAILER_URL}/sign-up`,
        senderName: `${sender.firstName} ${sender.lastName}`,
      },
    });

    return res.send_ok("Notebook Link Shared Successfully", {});
  } catch (error) {
    return res.send_internalServerError("An error occurred, please try again!");
  }
};
