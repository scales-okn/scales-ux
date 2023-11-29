module.exports = {
  title: "RingSchema",
  type: "object",
  required: ["rid", "name", "version", "userId", "dataSource", "ontology", "visibility"],
  properties: {
    id: {
      type: "number",
    },
    description: {
      type: ["string", "null"],
    },
    rid: {
      type: "number",
    },
    name: {
      type: "string",
    },
    version: {
      type: "number",
    },
    schemaVersion: {
      type: "number",
    },
    userId: {
      type: "number",
    },
    dataSource: {
      type: "object",
    },
    ontology: {
      type: "object",
    },
  },
};
