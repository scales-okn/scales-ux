module.exports = {
  title: "NotebookSchema",
  type: "object",
  required: ["id", "userId", "description", "title"],
  properties: {
    id: {
      type: "number",
    },
    userId: {
      type: "number",
    },
    title: {
      type: "string",
    },
    collaborators: {
      type: "array",
    },
    sharedWith: {
      type: "array",
    },
    visibility: {
      type: "string",
    },
    description: {
      type: ["string", "null"],
    },
    createdAt: {
      type: "string",
    },
    updatedAt: {
      type: "string",
    },
  },
};
