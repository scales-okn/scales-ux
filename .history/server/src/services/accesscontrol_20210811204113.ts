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

// TODO: Middleware for "contributors", "visibility", "deleted"