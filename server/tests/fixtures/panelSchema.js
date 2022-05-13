module.exports = {
  title: 'PanelSchema',
  type: 'object',
  required: ['notebookId', 'ringId', 'ringVersion', 'filters', 'results', 'contents'],
  properties: {
    id: {
      type: 'number',
    },
    description: {
      type: ['string', 'null'],
    },
    notebookId: {
      type: 'number',
    },
    ringId: {
      type: 'number',
    },
    ringVersion: {
      type: 'string',
    },
    filters: {
      type: 'object',
    },
    results: {
      type: 'object',
    },
    contents: {
      type: 'object',
    },
    analysis: {
      type: 'array',
    },
    deleted: {
      type: 'boolean',
      defaultValue: false,
    },
  },
}
