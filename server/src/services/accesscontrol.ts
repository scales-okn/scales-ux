import { AccessControl } from "accesscontrol";
// @ts-ignore
import AccessControlMiddleware from "accesscontrol-middleware";

export const grants = {
  admin: {
    users: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*"],
      "delete:any": ["*"],
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

export const accessControlMiddleware = new AccessControlMiddleware(ac);
