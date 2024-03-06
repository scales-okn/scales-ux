import dayjs from "dayjs";

type filterT = {
  id: string;
  type: string;
  value: any;
};

type queryBuilderT = {
  filters: filterT[];
  info: Record<string, unknown>;
};

export const queryBuilder = ({ filters, info }: queryBuilderT) => {
  const queryFilters =
    filters.length > 0
      ? filters?.map((filter) => {
          // TODO: remove one or the other
          if (filter.type === "dateFiled" || filter.type === "filing_date") {
            /* this will need to change once we implement multiple dateFiled filters */
            filter.value = `[${filter.value?.map((date) =>
              dayjs(date).format("YYYY-M-DD"),
            )}]`;
          }
          return filter;
        })
      : [];

  const filterFunc = (filterType, filterValue) => {
    const ontologyType = filterType === "ontology_labels";
    const notEmptyString = filterValue !== "";

    return ontologyType && notEmptyString
      ? "|" + filterValue + "|"
      : filterType === "case_type"
      ? { civil: "cv", criminal: "cr", "": "" }[filterValue]
      : filterValue;
  };

  if (queryFilters.length > 0) {
    const entity = info.defaultEntity;
    return {
      /* beware of changing this, as it needs to match convertFilters in viewHelpers.py on the backend :/ */
      AND: [
        ...queryFilters
          .map((filter) => {
            if (!filter.value) return null;
            return filter.value.includes("|")
              ? {
                  OR: [
                    ...filter.value
                      .split("|")
                      .filter((i) => i)
                      .map((or_filter_value) => {
                        return [
                          {
                            entity,
                            field: filter.type,
                          },
                          filterFunc(filter.type, or_filter_value),
                          "contains",
                        ];
                      }),
                  ],
                }
              : [
                  {
                    entity,
                    field: filter.type,
                  },
                  filterFunc(filter.type, filter.value),
                  "contains",
                ];
          })
          .filter((n) => n),
      ],
    };
  } else {
    return {};
  }
};
