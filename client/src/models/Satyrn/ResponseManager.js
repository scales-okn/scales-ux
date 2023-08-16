class ResponseManager {
  constructor(planManager, analysisSpace) {
    this.planManager = planManager;
    this.analysisSpace = analysisSpace;
  }

  generate = (searchFilters, plan, results) => {
    // generates the desc for an answered question
    // start with the statement from the dropdown
    let desc = this.planManager.expressPlan(plan);
    if (desc === "") return desc;
    // add filter info
    if (!Object.keys(searchFilters).length) {
      desc += " across all available data";
    } else {
      desc += " for data entries in which ";

      // this is going to be a bit of a hack for now as searchFilters in results
      // apparently don't include the entity they're housed on
      const attrExpressions = Object.assign(
        {},
        ...Object.entries(this.planManager.nicenameMap.fields).map(
          (entry) => entry[1],
        ),
      );
      // const queryBundle = plan.query.AND
      Object.entries(searchFilters).forEach((filt, idx) => {
        // get the entity from the plan...
        // const queryPart = queryBundle.find(qb => qb[0]["field"] == filt[0])
        // TODO: fix this next step so it works on any entity, not just _self
        const filtMeta = this.analysisSpace._self.attributes.find(
          (attr) => attr.targetField === filt[0],
        );
        if (idx !== 0) desc += " and ";
        if (
          filtMeta &&
          filtMeta.type === "date" &&
          Array.isArray(filt[1]) &&
          filt[1].length > 1
        ) {
          // debugger
          desc += `<em>${
            attrExpressions[filt[0]][0]
          }</em> is between <em>${new Date(
            filt[1][0],
          ).toLocaleDateString()}</em> and <em>${new Date(
            filt[1][1],
          ).toLocaleDateString()}</em>`;
        } else {
          desc += `<em>${attrExpressions[filt[0]][0]}</em> contains <em>"${
            filt[1]
          }"</em>`;
        }
      });
    }

    // also, append the results if there won't be any further info...
    // this assumes only one result at a time -- will have to expand in future iterations
    if (results.results?.length === 0) {
      desc += ` couldn't be generated.`;
    } else if (
      results.results?.length === 1 &&
      results.results[0]?.length === 1
    ) {
      const fresult = isNaN(Number(results.results[0]))
        ? results.units.results[0]
        : Number(results.results[0]).toLocaleString();
      desc += ` is ${fresult}`;

      const isPluralBit =
        results.units.results[0] &&
        results.units.results[0].length > 1 &&
        !["1", "-1", 1, -1].includes(fresult)
          ? 1
          : 0;

      if (
        results.units?.results &&
        results.units?.results[0] &&
        !["count", "averageCount"].includes(plan.op)
      )
        desc += ` ${results.units.results[0][isPluralBit]}`;
      desc += ".";
    } else {
      desc += ":";
    }

    return desc;
  };

  format = (plan, results) => {
    // return null if there is no data to render because the generate() statement is covering it...
    if (results.results.length < 2) return null;
    // okay, first check to see if the results have ids + references that need to be merged...
    const merged = this.mergeIdsAndReferences(
      results.results,
      results.fieldNames,
    );
    const cleanResults = merged[0];
    // const cleanFields = merged[1];

    let formattedResults = [];
    if (cleanResults[0].length === 2) {
      // simple list of tuples, assume [label, value]
      formattedResults = cleanResults.map((entry) => {
        return { label: entry[0], value: entry[1] };
      });
    } else if (cleanResults[0].length === 3) {
      // list of 3 = assume [series/group, label, value]
      let resultsMap = {};
      cleanResults.forEach((entry) => {
        if (!(entry[0] in resultsMap)) resultsMap[entry[0]] = [];
        resultsMap[entry[0]].push({ label: entry[1], value: entry[2] });
      });
      formattedResults = Object.entries(resultsMap).map((entry) => {
        return { series: entry[0], data: entry[1] };
      });
    } else {
      // (results.results[0].length > 3) only happens with multi group bys
      // come back and TODO
      // debugger
      return null;
    }

    return {
      data: formattedResults,
      visType: this.pickVisType(plan, formattedResults),
    };
  };

  mergeIdsAndReferences = (results, fields) => {
    // checks results[items] of 3 or more to see if two of the keys are really and id and reference for the same thing
    // if found, merge them...
    // results here is a list of tuples and fields is a list of objects of metadata
    if (fields.length < 3) return [results, fields];
    // do we have to merge?
    // how many ids?
    const idIndexes = fields
      .map((field) => field.field)
      .map((e, i) => (e === "id" ? i : ""))
      .filter(String);
    if (idIndexes.length === 0) return [results, fields];
    // if ids, how many references?
    const refIndexes = fields
      .map((field) => field.field)
      .map((e, i) => (e === "reference" ? i : ""))
      .filter(String);
    if (refIndexes.length === 0) return [results, fields];

    // for every id index, check if the next thing is a refIndex
    const matchedIds = idIndexes.filter(
      (indx, i) => refIndexes[i] === indx + 1,
    );
    if (matchedIds.length === 0) return [results, fields];

    // okay, so we have some merging to do in both all results entries + in fields
    const newResults = results.map((result) => {
      matchedIds.forEach((idx) => {
        const merger = result.slice(idx, idx + 2);
        const replacer = `${merger[1]} (${merger[0]})`;
        result[idx] = replacer;
        result[idx + 1] = "_PLACEHOLDER_";
      });
      return result.filter((step) => step !== "_PLACEHOLDER_");
    });

    matchedIds.forEach((idx) => {
      const merger = fields.slice(idx, idx + 2);
      merger[1].field = "reference+id";
      fields[idx] = merger[1];
      fields[idx + 1] = "_PLACEHOLDER_";
    });

    fields = fields.filter((step) => step !== "_PLACEHOLDER_");

    return [newResults, fields];
  };

  pickVisType = (plan, formattedResults) => {
    // options currently are bar, line and multiline...maybe groupedBar, stackedBar, scatter, geoMap and more later?
    // line or multiline if timeseries is present...
    if (plan.timeSeries) {
      // is there a group and data key in the entries? it's multiline
      if (formattedResults[0].series) return "multiline";
      return "line";
    }
    if (formattedResults[0].series) return "groupedBar";
    return "bar";
  };
}

export { ResponseManager };
