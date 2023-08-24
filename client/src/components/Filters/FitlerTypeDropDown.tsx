/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent, useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { useHelpTexts } from "store/helpTexts";

import FilterTooltip from "./FilterTooltip";

type FilterColumn = {
  key: string;
  nicename: string;
};

type FilterTypeProps = {
  filter: any;
  filters: any;
  setFilter: any;
  getFiltersNormalized: any;
  getFilterOptionsByKey: any;
};

const FilterTypeDropDown: FunctionComponent<FilterTypeProps> = (props) => {
  const {
    filter,
    filters,
    getFiltersNormalized,
    getFilterOptionsByKey,
    setFilter,
  } = props;
  const { type } = filter;
  const { helpTexts } = useHelpTexts();

  const filterOptions = getFilterOptionsByKey(type);

  const [filterInput, setFilterInput] = useState<FilterColumn>({
    key: type,
    nicename: filterOptions?.nicename,
  });

  useEffect(() => {
    try {
      if (filterInput) {
        // when changing filter type, reset the value
        const { type: dataType } = getFilterOptionsByKey(filterInput.key);
        setFilter({
          ...filter,
          type: filterInput.key,
          value: dataType === "boolean" ? "false" : "",
        });
      }
    } catch (error) {
      console.warn(error); // eslint-disable-line no-console
    }
  }, [filterInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtersToRender = getFiltersNormalized()
    ?.filter(
      (x) => x.nicename !== "Docket HTML" && x.nicename !== "Case Name",
    ) /* hack due to complaints from the docket-preview pane when i tried to change these fields' ring settings */
    .map((filterInput) => {
      const { allowMultiple, key } = filterInput;
      if (
        allowMultiple === false &&
        filters.some((filter: any) => filter.type === key)
      ) {
        return { ...filterInput, disabled: true };
      }

      return filterInput;
    })
    .sort((a, b) => a.nicename.localeCompare(b.nicename));
  console.log(filtersToRender);
  const matchHelpText = (key) => {
    return helpTexts?.find((helpText) => helpText.slug === key);
  };

  return (
    <Dropdown className="filter-type-dropdown">
      <Dropdown.Toggle
        size="sm"
        variant="link"
        className="shadow-none text-decoration-none small"
      >
        {filterInput?.nicename || ""}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Dropdown.ItemText className="text-muted fs-6 ms-3">
          <small>Select a filter type...</small>
        </Dropdown.ItemText>
        {filtersToRender?.map(({ key, nicename, desc, disabled }) => {
          const helpText = matchHelpText(key);

          return (
            <React.Fragment key={key}>
              <Dropdown.Divider />
              <Dropdown.Item
                onClick={() => setFilterInput({ key, nicename })}
                disabled={disabled}
                style={{ display: "flex", alignItems: "center" }}
              >
                <Dropdown.ItemText className={disabled ? "text-muted" : ""}>
                  {nicename}
                </Dropdown.ItemText>
                {desc && (
                  <Dropdown.ItemText className="text-muted fs-6">
                    <small>{desc}</small>
                  </Dropdown.ItemText>
                )}
                {helpText && <FilterTooltip helpText={helpText} />}
              </Dropdown.Item>
            </React.Fragment>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default FilterTypeDropDown;
