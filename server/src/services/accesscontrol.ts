import { AccessControlPlus, IContext } from "accesscontrol-plus";
import { Request, Response, NextFunction } from "express";
import _ from "lodash";

const userIsResourceOwner = ({ user, resource }) => {
  return user.id === resource.id;
};

const userIsPanelOwner = ({ user, resource }) => {
  return user.id === resource.userId;
};

const userIsPanelContributor = ({ user, resource }) => {
  return resource.collaborators.includes(user.id);
};

const userIsAllowedToReadPanel = ({ user, resource }) => {
  return resource.visibility.includes(user.id);
};

const userCanReadPanel = ({ user, resource }) => {
  if (userIsPanelOwner({ user, resource })) {
    return true;
  }
  // If panel is private
  if (resource.visibility === "private") {
    if (userIsPanelContributor({ user, resource })) {
      return true;
    }
    return false;
  }
  // If the panel is public
  if (resource.visibility === "public") {
    return true;
  }
  if (userIsAllowedToReadPanel({ user, resource })) {
    return true;
  }
  return false;
};

const userCanUpdatePanel = ({ user, resource }) => {
  if (userIsPanelOwner({ user, resource })) {
    return true;
  }

  if (userIsPanelContributor({ user, resource })) {
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

  // If panel is private
  if (resource.visibility === "private") {
    return false;
  }

  // If the panel is public
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
    .read
      .where(userIsResourceOwner)
        .onFields("firstName", "lastName", "usage", "email")
    .update
      .onFields("firstName", "lastName", "usage", "email")
        .where(userIsResourceOwner)
  // Panels
  .grant("user")
    .resource("panels")
      .read
        .where(userCanReadPanel)
        .onFields("title", "contents")
      .create
      .update
        .where(userCanUpdatePanel)
          .onFields("title", "contents")
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
  const exclude = Object.keys(fields).filter(
    (field) => fields[field] === false
  );
  const include = Object.keys(fields).filter((field) => fields[field] === true);

  output = { ..._.omit(output, exclude) };
  output = { ..._.pick(output, include) };

  return output;
};

export const accessControlMiddleware = (
  resource: string,
  action: string,
  context: IContext
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req;

      const permission = await accessControl.can(
        // @ts-ignore
        user.role,
        `${resource}:${action}`,
        context
      );

      if (permission.granted) {
        return next();
      } else {
        res.send_forbidden("Not allowed!");
      }
    } catch (error) {
      console.log(error);

      return res.send_internalServerError(
        "An error occured, please try again!"
      );
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
//     panels: {
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
//     panels: {
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
// visibility - panels => view it, rings => you can use
// deleted - only admin can view "deleted" panels; (soft delete) -> track date when deleted

// TODO: Ring Deletion
// soft delete - not available for anybody except admin - users that use it => this ring doesn't exist
// track date when deleted
// Can be viewed by anyone
// Users can create rings

// TODO: Range for the inputs

// TODO - Instantianting RING - JSON - Rings

// V2 -
