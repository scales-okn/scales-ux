import { AccessControlPlus, IContext } from "accesscontrol-plus";
import { Request, Response, NextFunction } from "express";
import _ from "lodash";

const userIsResourceOwner = ({ user, resource }) => {
  return user.id === resource.id;
};

const userIsNotebookOwner = ({ user, resource }) => {
  return user.id === resource.userId;
};

const userIsNotebookContributor = ({ user, resource }) => {
  return resource.collaborators.includes(user.id);
};

const userIsAllowedToReadNotebook = ({ user, resource }) => {
  return resource.visibility.includes(user.id);
};

const userCanReadNotebook = ({ user, resource }) => {
  if (userIsNotebookOwner({ user, resource })) {
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
  if (userIsNotebookOwner({ user, resource })) {
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

// prettier-ignore
accessControl
  // All
  .deny("*")
    .resource("*")
      .action("*")
  .grant("admin")
    .resource("*")
    .action("*")
  // Users
  .grant("user")
    .resource("users")
    .read.where(userIsResourceOwner).onFields("firstName", "lastName", "usage", "email")
    .update
      .onFields("firstName", "lastName", "usage", "email")
        .where(userIsResourceOwner)
  // Notebooks
  .grant("user")
    .resource("notebooks")
      .read.where(userCanReadNotebook)
        .onFields("*", "!userId")
      .update.where(userCanUpdateNotebook)
        .onFields("*", "!deleted")
  // Rings
  .grant("user")
    .resource("rings")
      .read.where(userCanReadRing)
        .onFields("*", "!userId")
      .update.where(userIsRingOwner)
        .onFields("*", "!deleted")

export const accessControlFieldsFilter = (input, fields) => {
  let output = input;

  if (Object.keys(fields).length === 0) {
    return output;
  }
  const exclude = Object.keys(fields).filter(field => fields[field] === false);
  const include = Object.keys(fields).filter(field => fields[field] === true);

  output = {..._.omit(output, exclude)}
  output = {..._.pick(output, include)}

  return output;
}

export const accessControlMiddleware = (resource: string, action: string, context: IContext) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;
      // @ts-ignore
      const permission = await accessControl.can(user.role, `${resource}:${action}`,context);

      if (permission.granted) {
        return next();
      } else {
        res.send_forbidden("Not allowed!");
      }
    } catch(error) {
      console.log(error);

      return res.send_internalServerError("An error occured, please try again!");
    }
  };
};

export default accessControl;

// import { AccessControl } from "accesscontrol";
// import AccessControlMiddleware from "accesscontrol-middleware";

// export const grants = {
//   admin: {
//     users: {
//       "create:any": ["*"],
//       "read:any": ["*"],
//       "delete:any": ["*"],
//       "update:any": ["*"],
//       "update:own": ["*", "!blocked"],
//     },
//     notebooks: {
//       "create:any": ["*"],
//       "read:any": ["*"],
//       "delete:any": ["*"],
//       "update:any": ["*"],
//       "update:own": ["*"],
//     },
//     rings: {
//       "create:any": ["*"],
//       "read:any": ["*"],
//       "delete:any": ["*"],
//       "update:any": ["*"],
//       "update:own": ["*"],
//     },
//   },
//   user: {
//     users: {
//       "read:own": ["*"],
//       "update:own": ["*", "!role"],
//     },
//     notebooks: {
//       "read:own": ["*"],
//       "update:own": ["*"],
//     },
//     rings: {
//       "read:own": ["*"],
//       "update:own": ["*"],
//     },
//   },
// };

// export const ac = new AccessControl(grants);

// ac.lock();

// export const accessControlMiddleware = new AccessControlMiddleware(ac);

// TODO: Middleware for "contributors", "visibility", "deleted"

// contributors - you can view, edit but no delete.
// visibility - notebooks => view it, rings => you can use
// deleted - only admin can view "deleted" notebooks; (soft delete) -> track date when deleted

// TODO: Ring Deletion
// soft delete - not available for anybody except admin - users that use it => this ring doesn't exist
// track date when deleted

// TODO: Range for the inputs

// TODO - Instantianting RING - JSON - Rings
