import { Request, Response } from "express";
import { sequelize } from "../database";
import accessControl from "../services/accesscontrol";
import { Op } from "sequelize";
import { permissionsFieldsFilter } from "../services/accesscontrol";
import { findAllAndPaginate } from "./util/findAllAndPaginate";

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
        const {
          description,
          ringId,
          ringVersion,
          filters,
          results,
          contents,
          analysis,
        } = panel;

        sequelize.models.Panel.create({
          description,
          notebookId: newNotebookId,
          ringId,
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

    const permission = await accessControl.can(role, "notebooks:read");
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const where = {
      ...(req.query.search
        ? { title: { [Op.iLike]: `%${req.query.search}%` } }
        : {}),
    };

    if (req.query.type === "public") {
      where[Op.and] = [
        { visibility: "public" },
        { userId: { [Op.ne]: userId } },
      ];
    } else {
      where[Op.or] = [
        { userId },
        // { collaborators: { [Op.contains]: [userId] } },
      ];
    }

    const result = await findAllAndPaginate({
      model: sequelize.models.Notebook,
      query: req.query,
      dataName: "notebooks",
      where,
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
    });

    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const { visibility, collaborators, userId } = notebook;
    if (
      role !== "admin" &&
      visibility !== "public" &&
      !collaborators.includes(reqUserId) &&
      userId !== reqUserId
    ) {
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
    if (
      role !== "admin" &&
      !collaborators.includes(reqUserId) &&
      userId !== reqUserId
    ) {
      return res.send_forbidden("Not allowed!");
    }

    //  Owner Operations Case
    if (userId !== reqUserId) {
      if (
        payload.includes("userId") ||
        payload.includes("collaborators") ||
        payload.includes("visibility")
      ) {
        return res.send_forbidden("Not allowed!");
      }
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

    if (!result.length) {
      return res.send_notModified("Notebook has not been updated!");
    }
    const updatedNotebook = await sequelize.models.Notebook.findOne({
      where: { id: notebookId },
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

    const { visibility, collaborators, userId } = notebook;
    // what does userId !== userId mean??
    if (
      role !== "admin" &&
      visibility !== "public" &&
      !collaborators.includes(userId) &&
      userId !== userId
    ) {
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
