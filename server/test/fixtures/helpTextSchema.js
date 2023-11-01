module.exports = {
  title: "HelpTextSchema",
  type: "object",
  required: ["description"],
  properties: {
    description: {
      type: "string",
    },
    examples: {
      type: "string",
    },
    options: {
      type: "string",
    },
    links: {
      type: "string",
    },
  },
};
