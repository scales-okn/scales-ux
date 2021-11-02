import { Request, Response } from "express";

import { sequelize } from "../database";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/ring.ts

// Create Ring
export const create = async (req: Request, res: Response) => {
  try {
    const {
      name,
      userId,
      panelId,
      contents,
      sourceType,
      connectionDetails,
      description,
      visibility,
    } = req.body;

    const ring = await sequelize.models.Ring.create({
      name,
      userId,
      contents,
      sourceType,
      connectionDetails,
      description,
      visibility,
    });

    if (panelId) {
      const ringId = ring.dataValues.id;
      addRingToPanel(ringId, panelId);
    }

    return res.send_ok("Ring created succesfully!", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

export const addRingToPanel = async (ringId: number, panelId: number) => {
  try {
    const panel = await sequelize.models.Panel.findByPk(panelId);
    await panel.addRing(ringId);
  } catch (error) {
    console.log(error);
  }
};

// Find all Rings
export const findAll = async (req: Request, res: Response) => {
  try {
    const rings = await sequelize.models.Ring.findAll({
      order: [["id", "DESC"]],
    });

    return res.send_ok("", { rings });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Find Ring by ringId
export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.ringId;
    const ring = await sequelize.models.Ring.findOne({ where: { id } });
    if (!ring) {
      return res.send_notFound("Ring not found!");
    }

    return res.send_ok("", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Update a Ring
export const update = async (req: Request, res: Response) => {
  try {
    const id = req.params.ringId;
    const payload = { ...req.body };

    // Inject req for saveLog
    //@ts-ignore
    sequelize.models.Ring.beforeUpdate((model) => {
      model.req = req;
    });

    const result = await sequelize.models.Ring.update(payload, {
      where: { id },
      individualHooks: true,
    });

    if (!result.length) {
      return res.send_notModified("Ring has not been updated!");
    }
    const ring = await sequelize.models.Ring.findOne({ where: { id } });

    return res.send_ok("Ring has been updated!", { ring });
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("An error occured, please try again!");
  }
};

// Delete a Ring
export const deleteRing = async (req: Request, res: Response) => {
  try {
    const id = req.params.ringId;
    const result = await sequelize.models.Ring.destroy({ where: { id } });
    if (result) {
      return res.send_ok("Ring has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete ring!");
  } catch (error) {
    console.log(error);

    return res.send_internalServerError("Failed to delete ring!");
  }
};
