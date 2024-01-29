import { AccessControlPlus } from "accesscontrol-plus";
import { sequelize } from "../database";

const userIsUserOwner = ({ user, resource }) => {
  return user.id === resource.id;
};

export const userOwnsNotebook = async ({ user, notebook }) => {
  const sessionUserTeam = await sequelize.models.Team.findOne({
    attributes: ["id"],
    include: [
      {
        model: sequelize.models.User,
        as: "users",
        where: { id: user.id },
        attributes: [],
      },
    ],
    raw: true,
  });

  const { visibility, collaborators, userId, sharedWith } = notebook;
  const isAdmin = user.role === "admin";
  const notebookIsPublic = visibility === "public";
  const sessionUserIsCollaborator = collaborators.includes(user.id);
  const notebookSharedWithSessionUser = sharedWith.includes(user.id);
  const sessionUserIsOwner = userId === user.id;
  const sessionUserIsNotebookTeamMember = sessionUserTeam && sessionUserTeam.id === notebook.teamId;

  return isAdmin || notebookIsPublic || sessionUserIsCollaborator || notebookSharedWithSessionUser || sessionUserIsOwner || sessionUserIsNotebookTeamMember;
};

const userCanUpdateNotebook = ({ user, notebook }) => {
  if (userOwnsNotebook({ user, notebook })) {
    return true;
  }

  return false;
};

const userIsRingOwner = ({ user, resource }) => {
  return user.id === resource.userId;
};

const userIsAllowedToReadRing = ({ user, resource }) => {
  return resource.visibility.includes(user.id);
};

const userCanReadRing = ({ user, resource }) => {
  if (userIsRingOwner({ user, resource })) {
    return true;
  }

  // If notebook is private
  if (resource.visibility === "private") {
    return false;
  }

  // If the notebook is public
  if (resource.visibility === "public") {
    return true;
  }

  if (userIsAllowedToReadRing({ user, resource })) {
    return true;
  }

  return false;
};

const accessControl = new AccessControlPlus();

const userReadRestrictedFields = ["!id", "!emailIsVerified", "!approved", "!blocked", "!emailVerificationToken", "!passwordResetToken", "!password"];

const userUpdateRestrictedFields = ["!id", "!role", ...userReadRestrictedFields];

//prettier-ignore
accessControl
  // All
  .deny("*")
    .resource("*")
      .action("*") 
  // Admin
  .grant("admin")
    .resource("*")
    .action("*")
    .onFields("*")
  // Users
  .grant("user")
    .resource("users")
    .read
      .where(userIsUserOwner)
      .onFields("*", ...userReadRestrictedFields)
    .update
      .onFields("*", ...userUpdateRestrictedFields)
        .where(userIsUserOwner)
  // Notebooks
  .grant("user")
    .resource("notebooks")
      .read
        .onFields("title")
      .create
      .update
        .where(userCanUpdateNotebook)
          .onFields("title", "description", "visibility", "collaborators", "teamId")
  // Rings
  .grant("user")
    .resource("rings")
      .read.where(userCanReadRing)
        .onFields("*", "!userId")
      .update.where(userIsRingOwner)
        .onFields("*", "!deleted")

export const permissionsFieldsFilter = (data, permission) => {
  try {
    return Object.keys(data).reduce((filteredData, field) => {
      if (permission.field(field)) {
        filteredData[field] = data[field];
      }
      return filteredData;
    }, {});
  } catch (error) {
    console.warn(error); // eslint-disable-line no-console
    return data;
  }
};

export default accessControl;
