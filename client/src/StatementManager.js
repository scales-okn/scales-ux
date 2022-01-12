class StatementManager {
  constructor(operations, analysisSpace, primaryRing) {
    this.operations = operations
    this.analysisSpace = analysisSpace
    this.primaryRing = primaryRing
  }
  generate = () => {
    // what follows is a hardcoded drop of example statements
    // the real StatementManager assembles the statements via this method + helper methods
    return [
      {
        statement: "Average contribution amount",
        parameters: [], // empty list means no follow on questions, see below for examples
        plan: {
          op: "average",
          target: {
            entity: "Contribution",
            field: "amount"
          },
          rings: [this.primaryRing], // a list to support future cross-ring stuff, always list of one for now
          relationships: [] // empty list reflects only one entity type is involved in this plan
        }
      },
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
          rings: [this.primaryRing],
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
          rings: [this.primaryRing],
          relationships: ["ContribToContributor"]
        }
      },
      {
        statement: "Count of contributors",
        parameters: [],
        plan: {
          op: "count",
          target: {
            entity: "Contributor",
            field: "id"
          },
          rings: [this.primaryRing],
          relationships: ["ContribToContributor"] // this one assumes that the search context is on Contributions, so we need a relationship to combine them
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
          rings: [this.primaryRing],
          relationships: ["ContribToCandidacy", "CandidacyToParty"]
        }
      },
      {
        statement: "Correlation between contribution amount and contribution in-state status",
        parameters: [
          { // this parameter type is to select from the set of possible values of the target attribute
            type: "value",
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
          rings: [this.primaryRing],
          relationships: []
        }
      }
    ]
  }
}

export {StatementManager};