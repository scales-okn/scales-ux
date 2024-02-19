import { Request, Response } from "express";
import { sequelize } from "../database";
import { notifyAdminsOfRingChange, createRingDiff } from "../models/Ring";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/ring.ts

// Create Ring
export const create = async (req: Request, res: Response) => {
  try {
    const { userId, rid, name, description, schemaVersion, dataSource, ontology, visibility, dbType } = req.body;

    let newVersionNum = 1;
    let ridToSave = rid;
    if (rid) {
      const existingRingVersions = await sequelize.models.Ring.findAll({
        where: { rid },
      });
      newVersionNum = existingRingVersions?.length + 1;
    } else {
      // Add one to the highest existing RID
      const allRings = await sequelize.models.Ring.findAll({
        attributes: [
          [sequelize.fn("max", sequelize.cast(sequelize.col("rid"), "integer")), "max_rid"], // Calculate the maximum 'rid' and alias it as 'max_rid'
        ],
        raw: true, // To get raw data (an array of objects) instead of instances
      });

      const maxRid = allRings[0]?.max_rid || 0;
      const maxNum = parseInt(maxRid, 10);
      ridToSave = maxNum + 1;
    }

    const newVersion = await sequelize.models.Ring.create({
      userId,
      rid: ridToSave,
      name,
      description,
      schemaVersion,
      dataSource,
      ontology,
      visibility,
      dbType,
      version: newVersionNum,
    });

    // only created diff if this is a new version to an existing ring
    if (rid) {
      const lastVersion = await sequelize.models.Ring.findOne({
        where: { rid, version: newVersionNum - 1 },
      });
      const updatedRingVersion = await createRingDiff({ lastVersion, newVersion });

      // if (process.env.NODE_ENV === "production") {
      notifyAdminsOfRingChange({ ringVersion: updatedRingVersion, initiatorUserId: userId });
      // }
    }

    const versions = await sequelize.models.Ring.findAll({
      where: { rid: ridToSave },
      order: [["version", "DESC"]],
      include: [{ model: sequelize.models.User, as: "user" }],
    });

    return res.send_ok("Ring created successfully!", { versions });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find all Rings
export const findAll = async (req: Request, res: Response) => {
  try {
    const rings = await sequelize.models.Ring.findAll({
      attributes: ["rid", [sequelize.fn("MAX", sequelize.col("version")), "maxVersion"]],
      group: ["rid"],
      raw: true,
    });

    const result = await Promise.all(
      rings.map(async ({ rid, maxVersion }) => {
        return await sequelize.models.Ring.findOne({
          where: sequelize.literal(`rid = '${rid}' AND version = ${maxVersion}`),
        });
      })
    );

    return res.send_ok("", { rings: result });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find Ring Versions by RID
export const getRingVersions = async (req: Request, res: Response) => {
  try {
    const rid = req.params.rid;

    const versions = await sequelize.models.Ring.findAll({
      where: { rid },
      order: [["version", "DESC"]],
      include: [{ model: sequelize.models.User, as: "user" }],
    });

    return res.send_ok("", { versions });
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console

    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Find Ring by ringRid and optionally version number
export const findById = async (req: Request, res: Response) => {
  try {
    const { rid, version } = req.params;

    const whereClause = {
      rid,
      ...(version ? { version } : {}),
    };

    // either get latest or specific version
    const ring = await sequelize.models.Ring.findOne({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (ring) {
      // Convert rid to a string for api's consumption
      ring.rid = String(ring.rid);
    } else {
      return res.send_notFound("Ring not found!");
    }

    return res.send_ok("", { ring });
  } catch (error) {
    console.warn(error);
    return res.send_internalServerError("An error occurred, please try again!");
  }
};

// Delete a Ring
export const deleteRing = async (req: Request, res: Response) => {
  try {
    const { rid } = req.params;
    const result = await sequelize.models.Ring.destroy({
      where: { rid },
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
