import { Request, Response } from "express";
import { sequelize } from "../database";
// import { findAllAndPaginate } from "./util/findAllAndPaginate";
// import { Op } from "sequelize";

// POST create
export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const sessionUser = await sequelize.models.User.findOne({
      //@ts-ignore
      where: { id: req.user.id },
    });

    if (!sessionUser) {
      return res.status(404).send("No user found!");
    }

    const newTeam = await sequelize.models.Team.create({
      name,
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
    const { viewed } = req.body;

    const team = await sequelize.models.Team.findOne({
      where: { id: teamId },
      include: [
        {
          model: sequelize.models.Connection,
          as: "connection",
        },
      ],
    });

    if (!team) {
      return res.status(404).send("No pending team found!");
    }

    await team.update({ viewed });

    // Send mailers here

    return res.send_ok("User has been updated!", {
      team,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    const sessionUser = await sequelize.models.User.findOne({
      // @ts-ignore
      where: { id: req.user.id },
      include: [
        {
          model: sequelize.models.Team,
          as: "teams",
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

    const result = sessionUser.teams;

    return res.send_ok("", result);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
