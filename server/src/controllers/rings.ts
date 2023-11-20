import { Request, Response } from "express";
import { sequelize } from "../database";
// import { notifyAdminsOfRingChange } from "../models/Ring";
import { v4 as uuidv4 } from "uuid";

// Resources validations are made with validateResources middleware and validations schemas
// server/middlewares/validateResources.ts
// server/validation/ring.ts

// Create Ring
export const create = async (req: Request, res: Response) => {
  try {
    const { userId, rid, name, description, schemaVersion, dataSource, ontology, visibility } = req.body;

    let newVersionNum = 1;
    if (rid) {
      const existingRingVersions = await sequelize.models.Ring.findAll({
        where: { rid },
      });
      newVersionNum = existingRingVersions?.length + 1;
    }

    const allRings = await sequelize.models.Ring.findAll({
      attributes: [
        [sequelize.fn("max", sequelize.col("rid")), "max_rid"], // Calculate the maximum 'rid' and alias it as 'max_rid'
      ],
      raw: true, // To get raw data (an array of objects) instead of instances
    });

    const newRid = rid || allRings[0].max_rid + 1;

    await sequelize.models.Ring.create({
      userId,
      rid: newRid,
      name,
      description,
      schemaVersion,
      dataSource,
      ontology,
      visibility,
      version: newVersionNum,
    });

    // TODO: readd notifications?
    // if (process.env.NODE_ENV === "production") {
    //   notifyAdminsOfRingChange({ ring, updatedRing, oldDataSource, oldOntology });
    // }

    const versions = await sequelize.models.Ring.findAll({
      where: { rid: newRid },
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

// TODO remove all references to the below

// // Find Ring by ringId
// export const findById = async (req: Request, res: Response) => {
//   try {
//     const { ringId } = req.params;
//     const ring = await Ring.findOne({
//       where: { rid: ringId },
//     });
//     if (!ring) {
//       return res.send_notFound("Ring not found!");
//     }

//     return res.send_ok("", { ring });
//   } catch (error) {
//     console.warn(error); // eslint-disable-line no-console

//     return res.send_internalServerError("An error occurred, please try again!");
//   }
// };

// // Find Ring by ringId
// export const version = async (req: Request, res: Response) => {
//   try {
//     const { ringId, version } = req.params;
//     const versions = await Ring.getVersions({
//       where: { rid: ringId, version },
//       order: [["versionTimestamp", "DESC"]],
//     });

//     if (versions.length === 0) {
//       return res.send_notFound("Ring version not found!");
//     }
//     const ring = Object.fromEntries(Object.entries(versions[0].dataValues).filter(([key]) => !["versionType", "versionTimestamp", "versionId"].includes(key)));

//     return res.send_ok("", { ring });
//   } catch (error) {
//     console.warn(error); // eslint-disable-line no-console

//     return res.send_internalServerError("An error occurred, please try again!");
//   }
// };

// // Update a Ring
// export const update = async (req: Request, res: Response) => {
//   try {
//     const { ringId } = req.params;

//     const ring = await Ring.findOne({
//       where: { id: ringId },
//     });
//     const oldDataSource = JSON.stringify(ring.dataSource);
//     const oldOntology = JSON.stringify(ring.ontology);

//     // Inject req for saveLog
//     Ring.beforeUpdate((model) => {
//       model.req = req;
//     });

//     const updatedRing = await ring.update(
//       { ...req.body, version: ring.dataValues.version + 1 },
//       {
//         individualHooks: true,
//         returning: true,
//       }
//     );

//     if (!updatedRing) {
//       return res.send_notModified("Ring has not been updated!");
//     }

//     return res.send_ok("Ring has been updated!", { ring });
//   } catch (error) {
//     console.warn(error); // eslint-disable-line no-console

//     return res.send_internalServerError("An error occurred, please try again!");
//   }
// };

// TODO refactor to find by rid
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
