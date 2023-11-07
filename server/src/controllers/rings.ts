import { Request, Response } from "express";
import { sendEmail } from "../services/sesMailer";
import { sequelize } from "../database";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/ring.ts

// Create Ring
export const create = async (req: Request, res: Response) => {
  try {
    const { userId, rid, name, description, schemaVersion, dataSource, ontology, visibility, version } = req.body;

    const ringExists = await sequelize.models.Ring.findOne({
      where: { rid },
    });

    if (ringExists) {
      return res.send_badRequest("RID must be unique!");
    }

    const ring = await sequelize.models.Ring.create({
      userId,
      rid,
      name,
      description,
      schemaVersion,
      dataSource,
      ontology,
      visibility,
      version,
    });

    return res.send_ok("Ring created successfully!", { ring });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
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
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find Ring by ringId
export const findById = async (req: Request, res: Response) => {
  try {
    const { ringId } = req.params;
    const ring = await sequelize.models.Ring.findOne({
      where: { rid: ringId },
    });
    if (!ring) {
      return res.send_notFound("Ring not found!");
    }

    return res.send_ok("", { ring });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find Ring by ringId
export const version = async (req: Request, res: Response) => {
  try {
    const { ringId, version } = req.params;
    const versions = await sequelize.models.Ring.getVersions({
      where: { rid: ringId, version },
      order: [["versionTimestamp", "DESC"]],
    });

    if (versions.length === 0) {
      return res.send_notFound("Ring version not found!");
    }
    const ring = Object.fromEntries(Object.entries(versions[0].dataValues).filter(([key]) => !["versionType", "versionTimestamp", "versionId"].includes(key)));

    return res.send_ok("", { ring });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Update a Ring
export const update = async (req: Request, res: Response) => {
  try {
    const { ringId } = req.params;

    const ring = await sequelize.models.Ring.findOne({
      where: { id: ringId },
    });

    // Inject req for saveLog
    sequelize.models.Ring.beforeUpdate((model) => {
      model.req = req;
    });

    const updated = await ring.update(
      { ...req.body, version: ring.dataValues.version + 1 },
      {
        individualHooks: true,
        returning: true,
      }
    );

    if (!updated) {
      return res.send_notModified("Ring has not been updated!");
    }

    const admins = await sequelize.models.User.findAll({
      where: { role: "admin" },
    });

    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction) {
      const ringName = `${ring.name} (RID: ${ring.id})`;

      admins.forEach((a) => {
        sendEmail({
          emailSubject: `Ring Updated (${ringName})`,
          recipientEmail: a.email,
          templateName: "ringUpdated",
          recipientName: `${a.firstName} ${a.lastName}`,
          templateArgs: {
            saturnUrl: process.env.UX_CLIENT_MAILER_URL,
            sesSender: process.env.SES_SENDER,
            dataSource: JSON.stringify(ring.dataSource),
            ontology: JSON.stringify(ring.ontology),
            ringName,
          },
        });
      });
    }

    return res.send_ok("Ring has been updated!", { ring });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Delete a Ring
export const deleteRing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await sequelize.models.Ring.destroy({
      where: { id },
    });

    if (result) {
      return res.send_ok("Ring has been deleted successfully!");
    }
    return res.send_internalServerError("Failed to delete ring!");
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("Failed to delete ring!");
  }
};
