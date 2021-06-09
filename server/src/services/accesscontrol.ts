import { AccessControl } from "accesscontrol";
// @ts-ignore
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
  },
  user: {
    users: {
      "read:own": ["*"],
      "update:own": ["*", "!role"],
    },
  },
};

export const ac = new AccessControl(grants);

ac.lock();

export const accessControlMiddleware = new AccessControlMiddleware(ac);
