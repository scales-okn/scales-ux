const generateMocks = (primaryRing) => [
  {
    statement: "Average count of contributions per contributor",
    parameters: [],
    plan: {
      op: "averageCount",
      target: {
        entity: "Contribution",
        field: "id"
      },
      per: {
        entity: "Contributor",
        field: "id"
      },
      rings: [primaryRing],
      relationships: ["ContribToContributor"] // how to relate contributions to contributors
    }
  },
  {
    statement: "Average count of contributions per contributor grouped by in-state status",
    parameters: [],
    plan: {
      op: "averageCount",
      target: {
        entity: "Contribution",
        field: "id"
      },
      per: {
        entity: "Contributor",
        field: "id"
      },
      groupBy: [{ // now with a group by
        entity: "Contribution",
        field: "inState"
      }],
      rings: [primaryRing],
      relationships: ["ContribToContributor"]
    }
  },
  {
    statement: "Distribution of contribution amount across party grouped by in-state status",
    parameters: [
      { // this parameter type is to select from an enum of available aggregation types
        type: "enum",
        slot: ["target", "op"], // key path steps within plan
        options: ["sum", "average"], // if plan.target.field is an id, then "count" would be here (maybe only option/default? @Andong: is None an option here?) -- in any event, this is the list of enum options to display
        prompt: "How should contribution amounts be aggregated?",
        allowMultiple: false
      }
    ],
    plan: {
      op: "distribution",
      target: {
        entity: "Contribution",
        field: "amount",
        op: null // this is satisfied by a parameter, see parameters key
      },
      over: {
        entity: "Party",
        field: "id"
      },
      groupBy: [{
        entity: "Contribution",
        field: "inState"
      }],
      rings: [primaryRing],
      relationships: ["ContribToCandidacy", "CandidacyToParty"]
    }
  },
  {
    statement: "Correlation between contribution amount and contribution recipient",
    parameters: [
      { // this parameter type is to select from the set of possible values of the target attribute
        type: "string",
        slot: ["target", 1, "numerator"], // key path steps within plan -- in this case, list entry
        options: { // given type == "value", the options here point to an entity.attribute to pull possible values from, just like a filter input -- in this example, it's a bool but in other cases this could be a string e.g. judge.name with autocomplete
          entity: "Contribution",
          attribute: "recipient",
        },
        prompt: "Which recipient(s) should be used to check for a correlation?",
        allowMultiple: true // could be a multiselect "and" or "or"
      }
    ],
    plan: {
      op: "correlation",
      target: [
        {
          entity: "Contribution",
          field: "amount" // since this is a numeric, we don't need a numerator
        },
        {
          entity: "Contribution",
          field: "recipient", // since this is a non-numeric, we need a numerator(s) selection via parameters
          numerator: null
        }
      ],
      grouping: {
        entity: "Contribution",
        field: "id"
      },
      rings: [primaryRing],
      relationships: []
    }
  },
  {
    statement: "Correlation between contribution amount and contribution in-state status",
    parameters: [
      { // this parameter type is to select from the set of possible values of the target attribute
        type: "boolean",
        slot: ["target", 1, "numerator"], // key path steps within plan -- in this case, list entry
        options: { // given type == "value", the options here point to an entity.attribute to pull possible values from, just like a filter input -- in this example, it's a bool but in other cases this could be a string e.g. judge.name with autocomplete
          entity: "Contribution",
          attribute: "inState",
        },
        prompt: "What in-state status value should be used to check for a correlation?",
        allowMultiple: true // could be a multiselect "and" or "or"
      }
    ],
    plan: {
      op: "correlation",
      target: [ // @Andong: I moved the target and target2 into one list of targets (bonus side effect is this scales to more than two as we go forward), and put the numerator in the relevant object where necessary -- cool?
        {
          entity: "Contribution",
          field: "amount" // since this is a numeric, we don't need a numerator
        },
        {
          entity: "Contribution",
          field: "inState", // since this is a non-numeric, we need a numerator(s) selection via parameters
          numerator: null
        }
      ],
      grouping: { // the grouping is implied by the fact that both attrs are attached to the same entity type -- if two entities involved, this setting would become a parameter (@Andong, gutcheck on that?)
        entity: "Contribution",
        field: "id"
      },
      rings: [primaryRing],
      relationships: []
    }
  }
]


class Satyrn {
  constructor(targetEntity, operations, analysisSpace, primaryRing) {
    this.targetEntity = targetEntity
    this.operations = operations
    this.analysisSpace = analysisSpace
    this.primaryRing = primaryRing
    this.planManager = new PlanManager(targetEntity, operations, analysisSpace, primaryRing)
    this.responseManager = new ResponseManager()
  }
}

class ResponseManager {
  generate = (responsePayload) => {
    return "Response payloads pending..."
  }
}

class PlanManager {
  constructor(targetEntity, operations, analysisSpace, primaryRing=null) {
    this.targetEntity = targetEntity
    this.operations = operations
    this.analysisSpace = analysisSpace
    this.primaryRing = primaryRing
    this.plans = []
    this.statements = []
    this.templateTokenMatcher = /{([^}]+)}/g
    this.nicenameMap = this.genNicenameMap(operations)
  }
  generate = (stub=null, stubType=null) => {
    let plans = []
    if (stub) {
      // shortcut full gen and just populate plans based on a plan stub
      // TODO
    } else {
      // full plan gen
      const ops = Object.keys(this.operations)
      Object.keys(this.analysisSpace).forEach(branch => {
        plans = [...plans, ...this.buildPlansFor(branch, ops, this.analysisSpace[branch], (branch == "_self") ? null : branch)]
      })
    }

    // plans should now be a big list of json objects
    // now populate the corresponding statements
    this.plans = plans.map(plan => {
      return {
        statement: this.expressPlan(plan),
        plan: plan
      }
    })

    // TEMP HACK: add some additional more complex plans during dev
    // TODO: pull out once stuff above is working better
    this.plans = [...this.plans, ...generateMocks()]

    return this.plans
  }
  buildPlansFor = (branch, ops, branchInfo, relationship=null) => {
    const attrs = branchInfo.attributes
    let basePlans = attrs.map(attr => {
      const basePlanTemplate = {
        target: {
          entity: branchInfo.entity,
          field: attr.targetField,
        },
        relationships: (relationship) ? [relationship] : []
      }
      let planSet = []
      ops.forEach(op => {
        if (op == "None") return;
        const requirements = this.operations[op].required
        if (!(requirements?.target?.validInputs || []).includes(attr.type)) return;

        // next two are temp hacks -- skip ops that require more than a single target and/or parameters
        // have to deal with percentage/correlations, average counts, etc
        if ((requirements?.target?.parameters || []).length > 0) return;
        if (Object.keys(requirements).length > 1 || !Object.keys(requirements).includes("target")) return;

        let newPlan = JSON.parse(JSON.stringify(basePlanTemplate))
        newPlan.op = op
        planSet.push(newPlan)
      })

      // manage ops with additional requirements
      // TODO

      // now add the timeframes
      // TODO
      // Note: Time series has an optional parameter of granularity or it's baked into the statement
        // - maybe it's "over time" and then always a second param?

      // now add the groupings
      // TODO

      return planSet
    }).flat()

    return basePlans
  }
  expressPlan = (plan) => {
    let opTemplate = this.nicenameMap.operations[plan.op]
    const pluralPicker = (["count"].includes(plan.op)) ? 1 : 0;
    if (!opTemplate) return null;
    [...opTemplate.matchAll(this.templateTokenMatcher)].forEach(match => {
      if (match[1] == "target") {
        opTemplate = opTemplate.replace(match[0], this.nicenameMap.fields[plan.target.entity][plan.target.field][pluralPicker])
      } else {
        // TODO: implementation for other types of slot-fillers
      }
    })
    return opTemplate
  }
  genNicenameMap = (operations) => {
    const operationsNicenames = Object.fromEntries(Object.keys(operations).map(op =>
      [op, operations[op].template]
    ))

    let fieldNicenames = Object.fromEntries(Object.entries(this.analysisSpace).map(branch =>
        [
          branch[1].entity, Object.fromEntries(
            [...branch[1].attributes.map(attr =>
                [attr.targetField, this.treatNicenames(attr.nicename)]),
              ["id", this.treatNicenames(branch[1].nicename)]]
          )
        ]
      )
    )

    return {
      operations: operationsNicenames,
      fields: fieldNicenames
    }
  }
  treatNicenames = (nicenames) => {
    if (typeof nicenames == "string") return [nicenames.toLowerCase(), nicenames.toLowerCase()]
    const firstNN = (nicenames[0] || "").toLowerCase()
    return [firstNN, (nicenames[1] || firstNN).toLowerCase()]
  }
}

export {Satyrn};