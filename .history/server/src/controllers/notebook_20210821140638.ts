import { Request, Response } from "express";
import { sequelize } from "../database/index.ts";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/notebook.ts

// Create Notebook
export const create = async (req: Request, res: Response) => {
  try {
    const {
      title,
      userId,
      collaborators = [],
      contents,
      visibility,
      parent = null,
    } = req.body;

    // TODO: Check if is needed.
    // const notebooks = await sequelize.models.Notebook.findAll({ where: { contents } });
    // if (notebooks?.length) {
    //   return res.send_badRequest("Notebook was not created!", {
    //     email: "An Notebook with the same contents already exists!",
    //   });
    // }

    const notebook = await sequelize.models.Notebook.create({
      title,
      userId,
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
    const notebooks = await sequelize.models.Notebook.findAll({
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
    if (!notebook) {
      return res.send_notFound("Notebook not found!");
    }

    return res.send_ok("", { notebook });
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
