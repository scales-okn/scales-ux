import { Request, Response } from "express";
import { sequelize } from "../database";
import accessControl, {
  accessControlFieldsFilter,
} from "../services/accesscontrol";
const { Op } = require("sequelize");

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/notebook.ts

// Create Notebook
export const create = async (req: Request, res: Response) => {
  try {
    const permission = await accessControl.can(
      // @ts-ignore
      req.user.role,
      "notebooks:create"
    );
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    const {
      title,
      collaborators = [],
      contents,
      visibility,
      parent = null,
    } = req.body;

    const notebook = await sequelize.models.Notebook.create({
      title,
      //@ts-ignore
      userId: req.user.id,
      collaborators,
      contents,
      visibility,
      parent,
    });

    console.log({ notebook });

    return res.send_ok("Notebook created succesfully!", { notebook });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find all Notebooks
export const findAll = async (req: Request, res: Response) => {
  try {
    const where =
      //@ts-ignore
      req.user.role === "admin"
        ? {}
        : {
            [Op.or]: [
              {
                //@ts-ignore
                visibility: "public",
              },
              {
                //@ts-ignore
                collaborators: { [Op.contains]: [req.user.id] },
              },
              {
                //@ts-ignore
                userId: req.user.id,
              },
            ],
          };

    const notebooks = await sequelize.models.Notebook.findAll({
      where,
      // attributes: { exclude: [""] }, // TODO: Check if we need to hide something.
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { notebooks });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find Notebook by notebookId
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.notebookId;
    const notebook = await sequelize.models.Notebook.findOne({ where: { id } });

    const permission = await accessControl.can(
      // @ts-ignore
      req.user.role,
      "notebooks:read",
      { user: req.user, resource: notebook }
    );
    if (!permission.granted) {
      return res.send_forbidden("Not allowed!");
    }

    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    return res.send_ok("", {
      notebook: accessControlFieldsFilter(
        notebook.dataValues,
        permission.fields
      ),
    });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

export const history = async (req: Request, res: Response) => {
  try {
    const id = req.params.notebookId;
    const notebook = await sequelize.models.Notebook.findOne({ where: { id } });
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    const versions = await sequelize.models.Notebook.getVersions({
      where: { id },
    });
    console.log(versions);

    return res.send_ok("", { versions });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a Notebook
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.notebookId;
    const payload = { ...req.body };

    // Inject req for saveLog
    //@ts-ignore
    sequelize.models.Notebook.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.Notebook.update(payload, {
      where: { id },
      individualHooks: true,
    });

    if (!result.length) {
      return res.send_notModified("Notebook has not been updated!");
    }
    const notebook = await sequelize.models.Notebook.findOne({ where: { id } });

    return res.send_ok("Notebook has been updated!", { notebook });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a Notebook
export const deleteNotebook = async (req: Request, res: Response) => {
  try {
    const id = req.params.notebookId;
    const result = await sequelize.models.Notebook.update(
      {
        deleted: true,
      },
      {
        where: { id },
      }
    );
    if (result) {
      return res.send_ok("Notebook has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete notebook!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete notebook!");
  }
};
