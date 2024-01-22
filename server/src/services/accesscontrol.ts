import { AccessControlPlus } from "accesscontrol-plus";

const userIsUserOwner = ({ user, resource }) => {
  return user.id === resource.id;
};

const userIsResourceOwner = ({ user, resource }) => {
  return user.id === resource.userId;
};

const userIsNotebookContributor = ({ user, resource }) => {
  return resource.collaborators.includes(user.id);
};

const userIsAllowedToReadNotebook = ({ user, resource }) => {
  return resource.visibility.includes(user.id);
};

const userCanReadNotebook = ({ user, resource }) => {
  if (userIsResourceOwner({ user, resource })) {
    return true;
  }
  // If notebook is private
  if (resource.visibility === "private") {
    if (userIsNotebookContributor({ user, resource })) {
      return true;
    }
    return false;
  }
  // If the notebook is public
  if (resource.visibility === "public") {
    return true;
  }
  if (userIsAllowedToReadNotebook({ user, resource })) {
    return true;
  }
  return false;
};

const userCanUpdateNotebook = ({ user, resource }) => {
  if (userIsResourceOwner({ user, resource })) {
    return true;
  }

  if (userIsNotebookContributor({ user, resource })) {
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
