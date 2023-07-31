class PlanManager {
  constructor(targetEntity, operations, analysisSpace, primaryRing = null) {
    this.targetEntity = targetEntity;
    this.operations = operations;
    this.analysisSpace = analysisSpace;
    this.primaryRing = primaryRing;
    this.plans = [];
    this.statements = [];
    this.templateTokenMatcher = /{([^}]+)}/g;
    this.nicenameMap = this.genNicenameMap(operations);
  }

  generate = () => {
    let plans = [];

    const ops = Object.keys(this.operations);

    Object.keys(this.analysisSpace).forEach((branch) => {
      plans.push(
        ...this.buildPlansFor(
          branch,
          ops,
          this.analysisSpace[branch],
          branch == "_self" ? null : branch,
        ),
      );
    });

    // plans should now be a big list of json objects
    // now populate the corresponding statements
    this.plans = plans.map((plan) => {
      // pull the params up out of base plan...
      const params = plan._parameters;
      delete plan._parameters;

      let fullPlan = {
        statement: this.expressPlan(plan),
        plan: plan,
      };
      if (params) fullPlan.parameters = params;

      return fullPlan;
    });

    // TEMP HACK: add some additional more complex plans during dev
    // TODO: pull out once stuff above is working better
    this.plans = [...this.plans];

    return this.plans;
  };

  buildPlansFor = (branch, ops, branchInfo, relationship = null) => {
    const attrs = branchInfo.attributes;
    let basePlans = attrs
      .map((attr) => {
        const basePlanTemplate = {
          target: {
            entity: branchInfo.entity,
            field: attr.targetField,
          },
          relationships: relationship ? [relationship] : [],
          _parameters: [], // gets plucked up a level for FE on the way out the door
        };
        let planSet = [];
        ops.forEach((op) => {
          if (op == "None") return;
          const requirements = this.operations[op].required;
          if (!(requirements?.target?.validInputs || []).includes(attr.type))
            return;

          // are there "per" fields to add?
          if (Object.keys(requirements).includes("per")) {
            // per fields always use relationships
            if (!relationship) {
              // means this is the target entity
              // iterate over the rest of the this.analysisSpace keys besides self
              // if relationship type makes sense (e.g. "m2m" or "m2o"), then add a plan
              Object.entries(this.analysisSpace)
                .filter((entry) => !(entry[0] === "_self"))
                .filter((entry) => ["m2o", "m2m"].includes(entry[1].relType))
                .forEach((entry) => {
                  planSet.push(
                    this._generateSpecialPlan(
                      "per",
                      basePlanTemplate,
                      op,
                      entry,
                    ),
                  );
                });
            } else {
              // means this is a related entity to the target
              // only tie this back to _self (the target)
              // but only if relationship type makes sense the other way (e.g. "m2m" or "o2m")
              Object.entries(this.analysisSpace)
                .filter((entry) => entry[0] === "_self")
                .filter((entry) => ["o2m", "m2m"].includes(entry[1].relType))
                .forEach((entry) => {
                  planSet.push(
                    this._generateSpecialPlan(
                      "per",
                      basePlanTemplate,
                      op,
                      entry,
                    ),
                  );
                });
            }
          } else {
            // just a one-off plan...finish/add it

            // next one is a temp hack -- skip ops that require more than a single target and/or parameters
            // have to deal with percentage/correlations, average counts, etc
            if (
              [
                "percentage",
                "distribution",
                "summaryStatistics",
                "oneHot",
                "correlation",
              ].includes(op)
            )
              return;

            let newPlan = JSON.parse(JSON.stringify(basePlanTemplate));
            newPlan.op = op;
            planSet.push(newPlan);
          }
        });

        // manage ops with additional requirements
        // TODO

        // now add the timeframes
        // do we have any relevant times we could use? add them in for each plan
        planSet = [
          ...planSet,
          ...planSet
            .map((ps) => {
              const planTemplate = JSON.parse(JSON.stringify(ps));
              let timeframePlans = [];
              // First, are we "on" the targetEntity or a related entity? get the details
              const asDetails =
                this.targetEntity === ps.target.entity
                  ? ["_self", this.analysisSpace["_self"]]
                  : Object.entries(this.analysisSpace).find(
                      (asPair) => asPair[1].entity === ps.target.entity,
                    );

              const defaultTimeframeOptions = Object.entries(
                this.nicenameMap.timeframes,
              ).map((tfp) => {
                return { label: tfp[1], value: tfp[0] };
              });

              if (
                asDetails[0] === "_self" ||
                !["m2o", "o2o"].includes(asDetails[1].relType)
              ) {
                // pluck timeframes on either related entity OR self (depending on above)
                timeframePlans = [
                  ...timeframePlans,
                  ...this._generateTimeframesFor(
                    this.targetEntity,
                    asDetails[1].attributes,
                    planTemplate,
                    defaultTimeframeOptions,
                  ),
                ];
              }
              return timeframePlans;
            })
            .flat(),
        ];

        // now add the groupings
        planSet = [
          ...planSet,
          ...planSet
            .map((ps) => {
              let groupedPlans = [];
              // try {
              const planTemplate = JSON.parse(JSON.stringify(ps));
              // } catch (error) {
              //   debugger
              // }
              // What can the targetEntity be grouped by?
              // First, are we "on" the targetEntity or a related entity? get the details
              // if (!ps.target) debugger
              const asDetails =
                this.targetEntity === ps.target.entity
                  ? ["_self", this.analysisSpace["_self"]]
                  : Object.entries(this.analysisSpace).find(
                      (asPair) => asPair[1].entity === ps.target.entity,
                    );
              // if not _self, what's the relationship to the target?
              // if m2o, direct group bys (e.g. contributors grouped by contribution) don't make sense
              // TODO: should this be permutations of all relationships across all entities? if so, we're going to need to rejigger analysisSpace
              if (asDetails[0] != "_self") {
                if (!["m2o", "o2o"].includes(asDetails[1].relType)) {
                  // make a plan copy and group by the related entity + id
                  groupedPlans.push({
                    ...planTemplate,
                    groupBy: [
                      {
                        entity: this.targetEntity,
                        field: "id",
                      },
                    ],
                  });
                }
              }

              if (
                asDetails[0] === "_self" ||
                !["m2o", "o2o"].includes(asDetails[1].relType)
              ) {
                // pluck enums / booleans on either related entity OR self (depending on above)
                // TODO: strings? numbers? buckets?
                groupedPlans = [
                  ...groupedPlans,
                  ...this._generateGroupsFor(
                    asDetails[1].entity,
                    asDetails[1].attributes,
                    planTemplate,
                  ),
                ];
              }

              return groupedPlans;
            })
            .flat(),
        ];
        return planSet;
      })
      .flat();
    return basePlans;
  };

  _generateGroupsFor = (
    entity,
    attributes,
    planTemplate,
    groupers = ["boolean", "enum"],
  ) =>
    attributes
      .filter((attr) => groupers.includes(attr.type))
      .map((attr) => {
        return {
          ...planTemplate,
          groupBy: [
            {
              entity: entity,
              field: attr.targetField,
            },
          ],
        };
      });

  _generateTimeframesFor = (
    entity,
    attributes,
    planTemplate,
    defaultTimeframeOptions,
  ) =>
    attributes
      .filter((attr) => ["datetime", "date", "date:year"].includes(attr.type)) // TODO: others?
      .map((attr) => {
        let updatedPlan = {
          ...JSON.parse(JSON.stringify(planTemplate)),
          timeSeries: {
            entity: entity,
            field: attr.targetField,
            dateTransform: "year", // year is the default, but can get changed in followup question
          },
        };

        let tfOptions = null;
        if (attr.type == "date:year")
          tfOptions = [{ label: "year-over-year", value: "year" }];
        if (attr.type == "date:month")
          tfOptions = [
            { label: "year-over-year", value: "year" },
            { label: "month-over-month", value: "month" },
          ];
        // TODO: others?
        if (!tfOptions) tfOptions = defaultTimeframeOptions;

        updatedPlan._parameters.push({
          type: "enum",
          options: tfOptions,
          slot: ["timeSeries", "dateTransform"],
          prompt: "At what time granularity?",
          allowMultiple: false,
        });

        return updatedPlan;
      })
      .flat();

  _generateSpecialPlan = (planType, basePlanTemplate, op, branch) => {
    let newPlan = JSON.parse(JSON.stringify(basePlanTemplate));
    newPlan.op = op;
    if (planType == "per") {
      newPlan.per = {
        field: "id",
        entity: branch[1].entity,
      };
      newPlan.relationships.push(branch[0]);
    } else {
      // others?
    }
    return newPlan;
  };

  expressPlan = (plan) => {
    let opTemplate = this.nicenameMap.operations[plan.op];
    const shouldBePlural = ["count", "averageCount", "averageSum"].includes(
      plan.op,
    );
    const pluralPicker = shouldBePlural ? 1 : 0;

    if (!opTemplate) return null;
    [...opTemplate.matchAll(this.templateTokenMatcher)].forEach((match) => {
      if (match[1] == "target") {
        opTemplate = opTemplate.replace(
          match[0],
          this.nicenameMap.fields[plan.target.entity][plan.target.field][
            pluralPicker
          ],
        );
      } else if (match[1] == "per") {
        opTemplate = opTemplate.replace(
          match[0],
          this.nicenameMap.fields[plan.per.entity][plan.per.field][0],
        );
      } else {
        console.log(match[1]);
        // TODO: implementation for other types of slot-fillers (e.g. plans with "per" slots)
      }
    });

    // do we have timeframes or group bys to express?

    // note: timeframes have been moved to follow-up questions, so timeframe is always "over time" now
    if (plan.timeSeries) {
      const ts = plan.timeSeries;
      if (plan.target.entity === ts.entity) {
        opTemplate = `${opTemplate} over time (by ${
          this.nicenameMap.fields[ts.entity][ts.field][0]
        })`;
      } else {
        // if (!this.nicenameMap.fields[ts.entity][ts.field]) debugger;
        opTemplate = `${opTemplate} over time (by ${ts.entity}'s ${
          this.nicenameMap.fields[ts.entity][ts.field][0]
        })`;
      }
    }

    if (plan.groupBy) {
      // might be multiple group bys so chain them...
      const groupBys = plan.groupBy
        .map((gb) => {
          let gbStatement = `grouped by ${
            this.nicenameMap.fields[gb.entity][gb.field][0]
          }`;
          if (gb.entity !== plan.target.entity) {
            // maybe mention the fact the groupBy is across a different entity?
            let entityMentionTest = true;
            const entityName = this.nicenameMap.fields[gb.entity].id[0];
            // unless...
            // a) that's already been stated (because it's already "group by <ENTITY NAME>")
            if (gb.field === "id") entityMentionTest = false;
            // b) the "per" field involves the second entity (?)
            if (gb.entity === plan.per?.entity) entityMentionTest = false;
            // c) the nicename of the attribute already mentions the entity
            if (gbStatement.toLowerCase().search(entityName.toLowerCase()))
              entityMentionTest = false;

            if (entityMentionTest) gbStatement += ` (of ${entityName})`;
          }
          return gbStatement;
        })
        .join(" ");
      opTemplate = `${opTemplate} ${groupBys}`;
    }
    return opTemplate;
  };

  genNicenameMap = (operations) => {
    const operationsNicenames = Object.fromEntries(
      Object.keys(operations).map((op) => [op, operations[op].template]),
    );

    let fieldNicenames = Object.fromEntries(
      Object.entries(this.analysisSpace).map((branch) => [
        branch[1].entity,
        Object.fromEntries([
          ...branch[1].attributes.map((attr) => [
            attr.targetField,
            this.treatNicenames(attr.nicename),
          ]),
          ["id", this.treatNicenames(branch[1].nicename)],
        ]),
      ]),
    );

    const timeframes = {
      day: "day-over-day",
      month: "month-over-month",
      year: "year-over-year",
      dayofweek: "across days of the week",
      onlyday: "across days of the month",
      onlymonth: "across months of the year",
    };

    return {
      operations: operationsNicenames,
      fields: fieldNicenames,
      timeframes: timeframes,
    };
  };

  treatNicenames = (nicenames) => {
    if (typeof nicenames == "string") {
      return [nicenames.toLowerCase(), nicenames.toLowerCase()];
    }
    const firstNN = (nicenames[0] || "").toLowerCase();
    return [firstNN, (nicenames[1] || firstNN).toLowerCase()];
  };
}

export { PlanManager };
