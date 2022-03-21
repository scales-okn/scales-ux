module.exports = {
  title: 'InfoSchema',
  type: 'object',
  required: ['analysisSpace', 'columns', 'defaultEntity', 'defaultSort'],
  properties: {
    analysisSpace: {
      type: 'array',
		},
		columns: {
      type: 'array'
    },
		defaultEntity: {
			type: 'string',
		},
		defaultSort: {
      type: 'object',
		},
		fieldUnits: {
			type: 'object',
		},
    filters: {
      type: ['array', 'null'],
    },
		includesRenderer: {
			type: 'boolean',
		},
		operations: {
			type: 'object',
		},
		targetEntities: {
			type: 'array',
		},
  }
}
 