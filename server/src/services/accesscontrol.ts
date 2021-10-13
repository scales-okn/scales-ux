import { AccessControl } from "accesscontrol";
import AccessControlMiddleware from "accesscontrol-middleware";

const userReadRestrictedFields = [
  "!emailIsVerified",
  "!approved",
  "!blocked",
  "!emailVerificationToken",
  "!passwordResetToken",
];

const userUpdateRestrictedFields = [
  "!id",
  "!role",
  ...userReadRestrictedFields,
];

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
      "read:own": ["*", ...userReadRestrictedFields],
      "update:own": ["*", ...userUpdateRestrictedFields],
    },
    notebooks: {
      "create:any": ["*"],
      "read:any": ["*"],
      "update:any": ["*", "!deleted", "!createdAt"],
      "delete:any": ["*"],
    },
    rings: {
      "read:own": ["*"],
      "update:own": ["*"],
    },
  },
};

const accessControl = new AccessControl(grants).lock();

export const accessControlMiddleware = new AccessControlMiddleware(
  accessControl
);
export default accessControl;
