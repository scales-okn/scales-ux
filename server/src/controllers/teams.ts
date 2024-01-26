import { Request, Response } from "express";
import { sequelize } from "../database";
import { sendEmail } from "../services/sesMailer";

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

    await newTeam.addUsers(sessionUser, { through: { role: "admin" } });

    const teamWithUsers = await sequelize.models.Team.findByPk(newTeam.id, {
      include: [
        {
          model: sequelize.models.User,
          as: "users",
          through: { attributes: ["role"] },
        },
        {
          model: sequelize.models.Notebook,
          as: "notebooks",
          attributes: ["id", "title", "description"],
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
    // @ts-ignore
    const sessionUserId = req.user.id;
    const { teamId } = req.params;
    const { viewed, userIdToAdd, userIdToRemove, userIdToUpdate, newUserRole, description, name } = req.body;

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
        await sequelize.models.Alert.create({
          userId: userIdToAdd,
          initiatorUserId: sessionUserId,
          type: "addedToTeam",
          teamId: team.id,
        });
        if (userToAdd.notifyOnTeamChange) {
          sendEmail({
            emailSubject: `You have been added to a team!`,
            recipientEmail: userToAdd.email,
            templateName: "notifyOnAddedToTeam",
            recipientName: `${userToAdd.firstName} ${userToAdd.lastName}`,
            templateArgs: {
              saturnUrl: process.env.UX_CLIENT_MAILER_URL,
              sesSender: process.env.SES_SENDER,
              teamName: team.name,
              url: `${process.env.UX_CLIENT_MAILER_URL}/teams`,
            },
          });
        }
      } else {
        return res.status(404).send("User to add not found!");
      }
    }

    if (userIdToRemove) {
      const userToRemove = await sequelize.models.User.findByPk(userIdToRemove);
      if (userToRemove) {
        await team.removeUsers(userToRemove);
        if (userToRemove.id !== sessionUserId) {
          await sequelize.models.Alert.create({
            userId: userIdToRemove,
            initiatorUserId: sessionUserId,
            type: "removedFromTeam",
            teamId: team.id,
          });
          if (userToRemove.notifyOnTeamChange) {
            sendEmail({
              emailSubject: `You have been removed from a team`,
              recipientEmail: userToRemove.email,
              templateName: "notifyOnRemovedFromTeam",
              recipientName: `${userToRemove.firstName} ${userToRemove.lastName}`,
              templateArgs: {
                saturnUrl: process.env.UX_CLIENT_MAILER_URL,
                sesSender: process.env.SES_SENDER,
                teamName: team.name,
              },
            });
          }
        }
      } else {
        return res.status(404).send("User to remove not found!");
      }
    }

    if (userIdToUpdate && newUserRole) {
      const userTeamAssociation = await sequelize.models.UserTeams.findOne({
        where: { userId: userIdToUpdate, teamId: team.id },
      });

      if (userTeamAssociation) {
        await userTeamAssociation.update({ role: newUserRole });
      } else {
        return res.status(404).send("User-team association not found!");
      }
    }

    await team.update({ viewed, description, name });

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

// DELETE team
export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const team = await sequelize.models.Team.findOne({
      where: { id: teamId },
    });

    if (!team) {
      return res.status(404).send("No team found!");
    }

    await team.destroy();

    return res.send_ok("Team has been deleted!");
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
            {
              model: sequelize.models.Notebook,
              as: "notebooks",
              attributes: ["id", "title", "description"],
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
