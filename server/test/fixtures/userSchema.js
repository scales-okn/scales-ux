module.exports = {
  title: "UserSchema",
  type: "object",
  required: ["firstName", "lastName", "email"],
  properties: {
    id: {
      type: "number",
    },
    approved: {
      type: "boolean",
    },
    blocked: {
      type: "boolean",
    },
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    email: {
      type: "string",
      unique: true,
    },
    emailVerificationToken: {
      anyOf: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
    emailIsVerified: {
      type: "boolean",
    },
    usage: {
      type: "string",
    },
    password: {
      type: "string",
    },
    role: {
      type: "string",
    },
    notifyOnNewRingVersion: {
      type: "boolean",
    },
  },
};
