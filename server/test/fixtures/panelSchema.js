module.exports = {
  title: "PanelSchema",
  type: "object",
  required: ["notebookId", "ringRid", "filters", "results", "contents"],
  properties: {
    id: {
      type: "number",
    },
    description: {
      type: ["string", "null"],
    },
    notebookId: {
      type: ["number", "null"],
    },
    ringRid: {
      type: ["number", "null"],
    },
    ringVersion: {
      type: ["string", "null"],
    },
    filters: {
      type: ["array", "null"],
    },
    results: {
      type: ["object", "null"],
    },
    contents: {
      type: ["object", "null"],
    },
    analysis: {
      type: "object",
    },
  },
};
