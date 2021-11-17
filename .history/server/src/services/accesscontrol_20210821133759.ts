import { AccessControl } from "accesscontrol";
import AccessControlMiddleware from "accesscontrol-middleware";

export const grants = {
  admin: {
    users: {
      "create:any": ["*"],
      "read:any": ["*"],
      "delete:any": ["*"],
      "update:any": ["*"],
      "update:own": ["*", "!blocked"],
    },
    notebooks: {
      "create:any": ["*"],
      "read:any": ["*"],
      "delete:any": ["*"],
      "update:any": ["*"],
      "update:own": ["*"],
    },
    rings: {
      "create:any": ["*"],
      "read:any": ["*"],
      "delete:any": ["*"],
      "update:any": ["*"],
      "update:own": ["*"],
    },
  },
  user: {
    users: {
      "read:own": ["*"],
      "update:own": ["*", "!role"],
    },
    notebooks: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
    rings: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
  },
};

export const ac = new AccessControl(grants);

ac.lock();

export const accessControlMiddleware = new AccessControlMiddleware(ac);

export default ac;

// TODO: Middleware for "contributors", "visibility", "deleted"

// contributors - you can view, edit but no delete.
// visibility - notebooks => view it, rings => you can use
// deleted - only admin can view "deleted" notebooks; (soft delete) -> track date when deleted

// TODO: Ring Deletion
// soft delete - not available for anybody except admin - users that use it => this ring doesn't exist
// track date when deleted
 
// TODO: Range for the inputs

// TODO - Instantianting RING - JSON - Rings 