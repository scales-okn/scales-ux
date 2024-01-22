import { Request, Response } from "express";
import { sequelize } from "../database";
// import { findAllAndPaginate } from "./util/findAllAndPaginate";
// import { Op } from "sequelize";

// POST create
export const create = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const sessionUser = await sequelize.models.User.findOne({
      //@ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const newTeam = await sequelize.models.Team.create({
      name,
      description,
    });

    await newTeam.addUsers(sessionUser, { through: { role: "lead" } });

    const teamWithUsers = await sequelize.models.Team.findByPk(newTeam.id, {
      include: [
        {
          model: sequelize.models.User,
          as: "users",
          through: { attributes: ["role"] },
        },
      ],
    });

    return res.send_ok("Team created successfully", { newTeam: teamWithUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// PUT update
export const update = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { viewed, userIdToAdd, userIdToRemove } = req.body;

    const team = await sequelize.models.Team.findOne({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).send("No pending team found!");
    }

    if (userIdToAdd) {
      const userToAdd = await sequelize.models.User.findByPk(userIdToAdd);
      if (userToAdd) {
        await team.addUsers(userToAdd, { through: { role: "read-only" } });
      } else {
        return res.status(404).send("User to add not found!");
      }
    }

    if (userIdToRemove) {
      const userToRemove = await sequelize.models.User.findByPk(userIdToRemove);
      if (userToRemove) {
        await team.removeUsers(userToRemove);
      } else {
        return res.status(404).send("User to remove not found!");
      }
    }

    await team.update({ viewed });

    return res.send_ok("Team has been updated!", {
      team: await team.reload({
        include: [
          {
            model: sequelize.models.User,
            as: "users",
            attributes: ["id", "firstName", "lastName", "email"],
            through: { attributes: ["role"] },
          },
        ],
      }),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

// GET findAll
export const findAll = async (req: Request, res: Response) => {
  try {
    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
      include: [
        {
          model: sequelize.models.Team,
          as: "teams",
          attributes: ["id", "name", "description"],
          include: [
            {
              model: sequelize.models.User,
              as: "users",
              attributes: ["id", "firstName", "lastName", "email"],
              through: { attributes: ["role"] },
            },
          ],
        },
      ],
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const teams = sessionUser.teams || [];

    return res.send_ok("", { teams });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
